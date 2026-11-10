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

function withWidgetExtensionTarget(config) {
  return withXcodeProject(config, (mod) => {
    const project = mod.modResults;
    const bundleId = `${config.ios.bundleIdentifier}${EXTENSION_BUNDLE_SUFFIX}`;
    const hasTarget = (project.pbxNativeTargetSection() || {}) &&
      Object.values(project.pbxNativeTargetSection()).some(
        (target) => target && target.name === EXTENSION_TARGET_NAME
      );
    if (!hasTarget) {
      project.addTarget(EXTENSION_TARGET_NAME, 'app_extension', EXTENSION_TARGET_NAME, bundleId);
    }
    return mod;
  });
}

function widgetInfoXml(provider) {
  return `<?xml version="1.0" encoding="utf-8"?>\n<appwidget-provider xmlns:android="http://schemas.android.com/apk/res/android"\n    android:minWidth="${provider.minWidth}"\n    android:minHeight="${provider.minHeight}"\n    android:targetCellWidth="${provider.targetCellWidth}"\n    android:targetCellHeight="${provider.targetCellHeight}"\n    android:updatePeriodMillis="1800000"\n    android:description="@string/widget_desc_${provider.name}"\n    android:previewImage="@mipmap/ic_launcher"\n    android:initialLayout="@layout/widget_loading"\n    android:resizeMode="horizontal|vertical"\n    android:widgetCategory="home_screen" />\n`;
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
  next = withWidgetAndroidManifest(next);
  next = withWidgetAndroidResources(next);
  return next;
}

module.exports = withHomeWidgets;
