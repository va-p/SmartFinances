module.exports = ({ config }) => ({
  ...config,
  plugins: [
    [
      '@revopush/expo-code-push-plugin',
      {
        ios: {
          CodePushDeploymentKey: '2S47-wY5h-5-wY25R_KLdc1NWkNqE12osk8wMe',
          CodePushServerUrl: 'https://api.revopush.org',
        },
        android: {
          CodePushDeploymentKey: '2S47-wY5h-5-wY25R_KLdc1NWkNqE12osk8wMe',
          CodePushServerUrl: 'https://api.revopush.org',
        },
      },
    ],
  ],
});
