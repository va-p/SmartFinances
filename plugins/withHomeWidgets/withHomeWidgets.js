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

function withWidgetExtensionTarget(config) {
  return withXcodeProject(config, (mod) => {
    const project = mod.modResults;
    const bundleId = `${config.ios.bundleIdentifier}${EXTENSION_BUNDLE_SUFFIX}`;
    let targetUuid = extensionTargetUuid(project);
    if (!targetUuid) {
      targetUuid = project.addTarget(EXTENSION_TARGET_NAME, 'app_extension', EXTENSION_TARGET_NAME, bundleId).uuid;
    }
    if (targetUuid) {
      project.updateBuildProperty('CODE_SIGN_ENTITLEMENTS', `"${EXTENSION_TARGET_NAME}/${EXTENSION_TARGET_NAME}.entitlements"`, null, EXTENSION_TARGET_NAME);
    }
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

function addSwiftSourcesToExtension(project, targetUuid, sourcesDir) {
  const groupKey = appGroupKey(project);
  if (!groupKey) return 0;
  let added = 0;
  fs.readdirSync(sourcesDir)
    .filter((file) => file.endsWith('.swift'))
    .forEach((file) => {
      if (project.hasFile(`Widgets/${file}`)) return;
      project.addSourceFile(`Widgets/${file}`, { target: targetUuid }, groupKey);
      added += 1;
    });
  return added;
}

// Copies the WidgetKit sources into ios/Widgets, writes the extension
// entitlements, and adds the sources to the extension target.
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
