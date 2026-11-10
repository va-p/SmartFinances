/* eslint-disable @typescript-eslint/no-var-requires -- Expo config plugins load via require; ESM import is not resolvable by the Expo config loader for local .js plugins. */
const path = require('path');
const fs = require('fs');

const {
  withAndroidManifest,
  withDangerousMod,
  withEntitlementsPlist,
  withXcodeProject,
} = require('@expo/config-plugins');

const { APP_GROUP_ID, getWidgetProviders } = require('./widget-manifest');

function copyDirRecursive(src, dst) {
  fs.mkdirSync(dst, { recursive: true });
  fs.readdirSync(src, { withFileTypes: true }).forEach((entry) => {
    const from = path.join(src, entry.name);
    const to = path.join(dst, entry.name);
    if (entry.isDirectory()) {
      copyDirRecursive(from, to);
    } else {
      fs.copyFileSync(from, to);
    }
  });
}

function projectRoot() {
  return path.join(__dirname, '..', '..');
}

const EXTENSION_TARGET_NAME = 'Widgets';
const EXTENSION_BUNDLE_SUFFIX = '.Widgets';

function withWidgetAppGroup(config) {
  return withEntitlementsPlist(config, (mod) => {
    const existing = mod.modResults['com.apple.security.application-groups'] || [];
    if (!existing.includes(APP_GROUP_ID)) {
      mod.modResults['com.apple.security.application-groups'] = [...existing, APP_GROUP_ID];
    }
    return mod;
  });
}

// Native target names carry plist quoting (e.g. '"Widgets"'); compare the
// unquoted value. Section keys are the target uuids.
function extensionTargetUuid(project) {
  const section = project.pbxNativeTargetSection() || {};
  const hit = Object.keys(section).find((key) => {
    const target = section[key];
    return (
      target &&
      typeof target.name === 'string' &&
      target.name.replace(/"/g, '') === EXTENSION_TARGET_NAME
    );
  });
  return hit || null;
}

function extensionEntitlements() {
  return `<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN" "http://www.apple.com/DTDs/PropertyList-1.0.dtd">
<plist version="1.0">
<dict>
\t<key>com.apple.security.application-groups</key>
\t<array>
\t\t<string>${APP_GROUP_ID}</string>
\t</array>
</dict>
</plist>
`;
}

// Direct-hash pbxproj helpers. The xcode lib's comment-based lookups
// (updateBuildProperty by name, addSourceFile target scoping) silently fall
// back to the wrong target when phases lack comments — verified against a
// real Release build (missing membership caused a cycle + wrong-target
// compile). These operate on uuids only.
function newUuid() {
  return require('crypto').randomUUID().replace(/-/g, '').toUpperCase().slice(0, 24);
}

function targetConfigs(project, targetUuid) {
  const { objects } = project.hash.project;
  const target = objects.PBXNativeTarget[targetUuid];
  const listRef = target && target.buildConfigurationList;
  const listId = listRef && listRef.value ? listRef.value : listRef;
  const list = listId && objects.XCConfigurationList[listId];
  if (!list) return [];
  const section = project.pbxXCBuildConfigurationSection();
  return list.buildConfigurations
    .map((entry) => section[entry.value])
    .filter(Boolean);
}

function setExtensionBuildSetting(project, targetUuid, prop, value) {
  targetConfigs(project, targetUuid).forEach((config) => {
    config.buildSettings[prop] = value;
  });
}

// FileRef key for a project-root-relative path, or null.
function fileRefForPath(project, filePath) {
  const section = project.hash.project.objects.PBXFileReference || {};
  const hit = Object.keys(section).find((key) => {
    if (/_comment$/.test(key)) return false;
    const ref = section[key];
    return ref && typeof ref.path === 'string' && ref.path.replace(/"/g, '') === filePath;
  });
  return hit || null;
}

// Embed App Extensions phase on the app target, positioned right after
// Resources (Xcode template order). A trailing position fuses with the
// RNFB Crashlytics script (dSYM + Info.plist inputs, no outputs) into a
// build cycle under Xcode 16+ (verified Release build failure).
function ensureEmbedPhase(project) {
  const { objects } = project.hash.project;
  const appUuid = Object.keys(objects.PBXNativeTarget || {}).find((key) => {
    if (/_comment$/.test(key)) return false;
    const t = objects.PBXNativeTarget[key];
    return t && typeof t.name === 'string' && t.name.replace(/"/g, '') === 'SmartFinances';
  });
  if (!appUuid) return;
  const appTarget = objects.PBXNativeTarget[appUuid];
  const appexRef = (() => {
    const target = objects.PBXNativeTarget[extensionTargetUuid(project)];
    const ref = target && target.productReference;
    return (ref && (ref.value || ref)) || fileRefForPath(project, 'Widgets.appex');
  })();
  if (!appexRef) return;
  let phaseUuid = (appTarget.buildPhases || [])
    .map((entry) => entry.value || entry)
    .find((id) => objects.PBXCopyFilesBuildPhase && objects.PBXCopyFilesBuildPhase[id]);
  if (!phaseUuid) {
    phaseUuid = newUuid();
    objects.PBXCopyFilesBuildPhase = objects.PBXCopyFilesBuildPhase || {};
    objects.PBXCopyFilesBuildPhase[phaseUuid] = {
      isa: 'PBXCopyFilesBuildPhase',
      buildActionMask: 2147483647,
      dstPath: '""',
      dstSubfolderSpec: '13',
      files: [],
      name: '"Copy Files"',
      runOnlyForDeploymentPostprocessing: 0,
    };
    objects.PBXCopyFilesBuildPhase[`${phaseUuid}_comment`] = 'Copy Files';
  }
  const phase = objects.PBXCopyFilesBuildPhase[phaseUuid];
  phase.files = phase.files || [];
  const buildUuid = newUuid();
  if (!phase.files.some((entry) => (entry.value || entry) && objects.PBXBuildFile[(entry.value || entry)] && objects.PBXBuildFile[(entry.value || entry)].fileRef === appexRef)) {
    objects.PBXBuildFile = objects.PBXBuildFile || {};
    objects.PBXBuildFile[buildUuid] = { isa: 'PBXBuildFile', fileRef: appexRef };
    objects.PBXBuildFile[`${buildUuid}_comment`] = 'Widgets.appex in Copy Files';
    phase.files.push({ value: buildUuid, comment: 'Widgets.appex in Copy Files' });
  }
  const phases = appTarget.buildPhases.map((entry) => entry.value || entry);
  const without = phases.filter((id) => id !== phaseUuid);
  const resIdx = without.findIndex((id) => {
    const s = objects.PBXResourcesBuildPhase && objects.PBXResourcesBuildPhase[id];
    return !!s;
  });
  const at = resIdx === -1 ? without.length : resIdx + 1;
  without.splice(at, 0, phaseUuid);
  // eslint-disable-next-line no-param-reassign -- pbxproj mutation is this helper's entire job
  appTarget.buildPhases = without.map((id) => {
    const section = [objects.PBXSourcesBuildPhase, objects.PBXFrameworksBuildPhase, objects.PBXResourcesBuildPhase, objects.PBXCopyFilesBuildPhase, objects.PBXShellScriptBuildPhase]
      .map((sec) => sec && sec[`${id}_comment`]).find(Boolean);
    return { value: id, comment: section || '' };
  });
}

// Copies the WidgetKit sources into ios/Widgets, writes the extension
// entitlements, and adds the sources to the extension target.

function withWidgetExtensionTarget(config) {
  return withXcodeProject(config, (mod) => {
    const project = mod.modResults;
    const bundleId = `${config.ios.bundleIdentifier}${EXTENSION_BUNDLE_SUFFIX}`;
    let targetUuid = extensionTargetUuid(project);
    if (!targetUuid) {
      targetUuid = project.addTarget(EXTENSION_TARGET_NAME, 'app_extension', EXTENSION_TARGET_NAME, bundleId).uuid;
    }
    setExtensionBuildSetting(project, targetUuid, 'CODE_SIGN_ENTITLEMENTS', `"${EXTENSION_TARGET_NAME}/${EXTENSION_TARGET_NAME}.entitlements"`);
    setExtensionBuildSetting(project, targetUuid, 'PRODUCT_BUNDLE_IDENTIFIER', `${config.ios.bundleIdentifier}${EXTENSION_BUNDLE_SUFFIX}`);
    setExtensionBuildSetting(project, targetUuid, 'SWIFT_VERSION', '5.0');
    setExtensionBuildSetting(project, targetUuid, 'IPHONEOS_DEPLOYMENT_TARGET', '17.0');
    setExtensionBuildSetting(project, targetUuid, 'TARGETED_DEVICE_FAMILY', '"1,2"');
    ensureEmbedPhase(project);
    return mod;
  });
}

// Group key of the app group (the one holding AppDelegate.swift). Extension
// sources live in ios/Widgets and are referenced with project-root paths.
function appGroupKey(project) {
  const groups = project.hash.project.objects.PBXGroup || {};
  const hit = Object.keys(groups).find((key) => {
    if (/_comment$/.test(key)) return false;
    const group = groups[key];
    return (
      group &&
      Array.isArray(group.children) &&
      group.children.some((child) => /AppDelegate\.swift/.test(child.comment || ''))
    );
  });
  return hit || null;
}

function ensureFileRef(project, filePath, name) {
  const existing = fileRefForPath(project, filePath);
  if (existing) return existing;
  const uuid = newUuid();
  // eslint-disable-next-line no-param-reassign -- pbxproj mutation is this helper's entire job
  project.hash.project.objects.PBXFileReference[uuid] = {
    isa: 'PBXFileReference',
    lastKnownFileType: 'sourcecode.swift',
    name,
    path: filePath,
    sourceTree: '"<group>"',
  };
  // eslint-disable-next-line no-param-reassign -- pbxproj mutation is this helper's entire job
  project.hash.project.objects.PBXFileReference[`${uuid}_comment`] = name;
  const groupKey = appGroupKey(project);
  if (groupKey) {
    project.hash.project.objects.PBXGroup[groupKey].children.push({
      value: uuid,
      comment: name,
    });
  }
  return uuid;
}

function targetSourcesPhase(project, targetUuid) {
  const { objects } = project.hash.project;
  const target = objects.PBXNativeTarget[targetUuid];
  if (!target) return null;
  const ids = (target.buildPhases || []).map((entry) => entry.value || entry);
  const found = ids.find((id) => objects.PBXSourcesBuildPhase && objects.PBXSourcesBuildPhase[id]);
  if (found) return { uuid: found, phase: objects.PBXSourcesBuildPhase[found] };
  // addTarget (this lib version) creates phaseless targets: create + register.
  const uuid = newUuid();
  const phase = {
    isa: 'PBXSourcesBuildPhase',
    buildActionMask: 2147483647,
    files: [],
    runOnlyForDeploymentPostprocessing: 0,
  };
  objects.PBXSourcesBuildPhase[uuid] = phase;
  objects.PBXSourcesBuildPhase[`${uuid}_comment`] = 'Sources';
  target.buildPhases.push({ value: uuid, comment: 'Sources' });
  return { uuid, phase };
}

function buildFileForRef(project, phase, fileRefUuid) {
  const { objects } = project.hash.project;
  return (phase.files || []).find((entry) => {
    const buildFile = objects.PBXBuildFile[entry.value || entry];
    if (!buildFile) return false;
    const ref = buildFile.fileRef;
    return ref === fileRefUuid || (ref && (ref.value || ref) === fileRefUuid);
  });
}

function ensureBuildFileInPhase(project, phase, fileRefUuid, comment) {
  if (buildFileForRef(project, phase, fileRefUuid)) return;
  const uuid = newUuid();
  // eslint-disable-next-line no-param-reassign -- pbxproj mutation is this helper's entire job
  project.hash.project.objects.PBXBuildFile[uuid] = {
    isa: 'PBXBuildFile',
    fileRef: fileRefUuid,
  };
  // eslint-disable-next-line no-param-reassign -- pbxproj mutation is this helper's entire job
  project.hash.project.objects.PBXBuildFile[`${uuid}_comment`] = comment;
  phase.files.push({ value: uuid, comment });
}

// Remove build files, memberships, refs, and group entries for
// Widgets/*.swift files that no longer exist on disk (e.g. after a rename).
// Stale refs break the build with missing-file errors.
function pruneMissingSwiftSources(project, targetUuid, sourcesDir) {
  if (!fs.existsSync(sourcesDir)) return;
  const { objects } = project.hash.project;
  const onDisk = new Set(
    fs.readdirSync(sourcesDir).filter((file) => file.endsWith('.swift'))
  );
  const refPath = (refUuid) => {
    const ref = refUuid && objects.PBXFileReference[refUuid];
    const filePath = ref && ref.path;
    return typeof filePath === 'string' ? filePath.replace(/"/g, '') : '';
  };
  const isStaleWidgetRef = (comment, candidateRefUuid) =>
    typeof comment === 'string' &&
    comment.endsWith('.swift in Sources') &&
    refPath(candidateRefUuid).startsWith('Widgets/') &&
    !onDisk.has(comment.replace(' in Sources', ''));
  Object.keys(objects.PBXBuildFile || {}).forEach((key) => {
    if (/_comment$/.test(key)) return;
    const entry = objects.PBXBuildFile[key];
    const comment = objects.PBXBuildFile[`${key}_comment`];
    const ref = entry && entry.fileRef;
    const refUuid = ref && (ref.value || ref);
    if (!isStaleWidgetRef(comment, refUuid)) return;
    Object.keys(objects.PBXSourcesBuildPhase || {}).forEach((phaseKey) => {
      if (/_comment$/.test(phaseKey)) return;
      const phase = objects.PBXSourcesBuildPhase[phaseKey];
      if (!phase || !Array.isArray(phase.files)) return;
      // eslint-disable-next-line no-param-reassign -- pbxproj mutation is this helper's entire job
      phase.files = phase.files.filter((item) => (item.value || item) !== key);
    });
    delete objects.PBXBuildFile[key];
    delete objects.PBXBuildFile[`${key}_comment`];
    if (refUuid && objects.PBXFileReference && objects.PBXFileReference[refUuid]) {
      delete objects.PBXFileReference[refUuid];
      delete objects.PBXFileReference[`${refUuid}_comment`];
    }
    Object.keys(objects.PBXGroup || {}).forEach((groupKey) => {
      if (/_comment$/.test(groupKey)) return;
      const group = objects.PBXGroup[groupKey];
      if (!group || !Array.isArray(group.children)) return;
      // eslint-disable-next-line no-param-reassign -- pbxproj mutation is this helper's entire job
      group.children = group.children.filter(
        (child) => (child.value || child) !== refUuid
      );
    });
  });
}

function addSwiftSourcesToExtension(project, targetUuid, sourcesDir) {
  const holder = targetSourcesPhase(project, targetUuid);
  if (!holder) return 0;
  let added = 0;
  fs.readdirSync(sourcesDir)
    .filter((file) => file.endsWith('.swift'))
    .forEach((file) => {
      const refUuid = ensureFileRef(project, `Widgets/${file}`, file);
      const before = (holder.phase.files || []).length;
      ensureBuildFileInPhase(project, holder.phase, refUuid, `${file} in Sources`);
      if ((holder.phase.files || []).length > before) added += 1;
    });
  return added;
}

function withWidgetExtensionSources(config) {
  const withFiles = withDangerousMod(config, [
    'ios',
    (mod) => {
      const root = projectRoot();
      const dst = path.join(mod.modProjectRoot, EXTENSION_TARGET_NAME);
      copyDirRecursive(path.join(root, 'targets', 'widgets'), dst);
      fs.writeFileSync(path.join(dst, `${EXTENSION_TARGET_NAME}.entitlements`), extensionEntitlements());
      return mod;
    },
  ]);
  return withXcodeProject(withFiles, (mod) => {
    const project = mod.modResults;
    const targetUuid = extensionTargetUuid(project);
    if (!targetUuid) {
      return mod;
    }
    pruneMissingSwiftSources(project, targetUuid, path.join(projectRoot(), 'targets', 'widgets'));
    addSwiftSourcesToExtension(project, targetUuid, path.join(projectRoot(), 'targets', 'widgets'));
    return mod;
  });
}

function widgetInfoXml(provider) {
  const configure =
    provider.name === 'overview_small'
      ? '\n    android:configure="com.vap.smartfinances.widgets.OverviewSmallConfigureActivity"'
      : '';
  return `<?xml version="1.0" encoding="utf-8"?>\n<appwidget-provider xmlns:android="http://schemas.android.com/apk/res/android"${configure}\n    android:minWidth="${provider.minWidth}"\n    android:minHeight="${provider.minHeight}"\n    android:targetCellWidth="${provider.targetCellWidth}"\n    android:targetCellHeight="${provider.targetCellHeight}"\n    android:updatePeriodMillis="1800000"\n    android:description="@string/widget_desc_${provider.name}"\n    android:previewImage="@mipmap/ic_launcher"\n    android:initialLayout="@layout/widget_loading"\n    android:resizeMode="horizontal|vertical"\n    android:widgetCategory="home_screen" />\n`;
}

function withWidgetAndroidManifest(config) {
  return withAndroidManifest(config, (mod) => {
    const application = mod.modResults.manifest.application[0];
    application.receiver = application.receiver || [];

    getWidgetProviders().forEach((provider) => {
      const exists = application.receiver.some(
        (receiver) => receiver.$['android:name'] === provider.className
      );
      if (exists) {
        return;
      }
      application.receiver.push({
        $: {
          'android:name': provider.className,
          'android:exported': 'false',
          'android:label': provider.title,
        },
        'intent-filter': [
          {
            action: [
              { $: { 'android:name': 'android.appwidget.action.APPWIDGET_UPDATE' } },
            ],
          },
        ],
        'meta-data': [
          {
            $: {
              'android:name': 'android.appwidget.provider',
              'android:resource': provider.xmlResource,
            },
          },
        ],
      });
    });
    return mod;
  });
}

// Configuration activity for the Overview Small A/B variant (widget-system
// config, default Variant A). Registered once; T9 owns the activity code.
function withWidgetConfigureActivity(config) {
  return withAndroidManifest(config, (mod) => {
    const application = mod.modResults.manifest.application[0];
    application.activity = application.activity || [];
    const name = 'com.vap.smartfinances.widgets.OverviewSmallConfigureActivity';
    const exists = application.activity.some((a) => a.$['android:name'] === name);
    if (!exists) {
      application.activity.push({
        $: {
          'android:name': name,
          'android:exported': 'true',
          'android:theme': '@android:style/Theme.Material.Light.Dialog',
        },
        'intent-filter': [
          {
            action: [{ $: { 'android:name': 'android.appwidget.action.APPWIDGET_CONFIGURE' } }],
          },
        ],
      });
    }
    return mod;
  });
}

function withWidgetAndroidSources(config) {
  return withDangerousMod(config, [
    'android',
    (mod) => {
      const root = projectRoot();
      copyDirRecursive(
        path.join(root, 'targets', 'widgets-android', 'java'),
        path.join(mod.modProjectRoot, 'app', 'src', 'main', 'java')
      );
      copyDirRecursive(
        path.join(root, 'targets', 'widgets-android', 'res'),
        path.join(mod.modProjectRoot, 'app', 'src', 'main', 'res')
      );
      return mod;
    },
  ]);
}

function withWidgetAndroidResources(config) {
  return withDangerousMod(config, [
    'android',
    (mod) => {
      const resDir = path.join(mod.modProjectRoot, 'res', 'xml');
      fs.mkdirSync(resDir, { recursive: true });
      getWidgetProviders().forEach((provider) => {
        fs.writeFileSync(
          path.join(resDir, `widget_info_${provider.name}.xml`),
          widgetInfoXml(provider)
        );
      });
      return mod;
    },
  ]);
}

function withHomeWidgets(config) {
  let next = withWidgetAppGroup(config);
  next = withWidgetExtensionTarget(next);
  next = withWidgetExtensionSources(next);
  next = withWidgetAndroidManifest(next);
  next = withWidgetConfigureActivity(next);
  next = withWidgetAndroidResources(next);
  next = withWidgetAndroidSources(next);
  return next;
}

module.exports = withHomeWidgets;

// Test seam: deterministic verification without running a full prebuild
// (the xcode lib fails silently on comment-less phases — see F6).
module.exports.internals = {
  extensionTargetUuid,
  targetConfigs,
  setExtensionBuildSetting,
  fileRefForPath,
  appGroupKey,
  ensureFileRef,
  targetSourcesPhase,
  ensureBuildFileInPhase,
  addSwiftSourcesToExtension,
  pruneMissingSwiftSources,
  ensureEmbedPhase,
};
