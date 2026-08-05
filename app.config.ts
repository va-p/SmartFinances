module.exports = ({ config }) => ({
  ...config,
  plugins: [
    // Temporarily disabled for SDK 57 upgrade - revopush plugin incompatible, will re-add manually
    // [
    //   '@revopush/expo-code-push-plugin',
    //   {
    //     ios: {
    //       CodePushDeploymentKey: '2S47-wY5h-5-wY25R_KLdc1NWkNqE12osk8wMe',
    //       CodePushServerUrl: 'https://api.revopush.org',
    //     },
    //     android: {
    //       CodePushDeploymentKey: '2S47-wY5h-5-wY25R_KLdc1NWkNqE12osk8wMe',
    //       CodePushServerUrl: 'https://api.revopush.org',
    //     },
    //   },
    // ],
    "@react-native-community/datetimepicker",
    "expo-font",
    "expo-router",
    "expo-secure-store",
    "expo-splash-screen",
    "expo-video",
    "expo-web-browser",
  ],
});
