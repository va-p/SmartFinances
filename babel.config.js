module.exports = function (api) {
  api.cache(true);
  return {
    presets: ['babel-preset-expo'],
    plugins: [
      'inline-dotenv',
      [
        'module-resolver',
        {
          root: ['./src'],
          extensions: [
            '.ts',
            '.tsx',
            '.js',
            '.json'
          ],
          alias: {
            '@components': './src/components',
            '@themes': './src/global/styles',
            '@contexts': './src/contexts',
            '@services': './src/services',
            '@configs': './src/configs',
            '@screens': './src/screens',
            '@routes': './src/routes',
            '@assets': './src/assets',
            '@slices': './src/slices',
            '@utils': './src/utils',
            '@hooks': './src/hooks',
            '@api': './src/api'
          }
        }
      ],
      'react-native-reanimated/plugin',
    ],
  };
};
