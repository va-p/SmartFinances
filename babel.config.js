module.exports = function (api) {
  api.cache(true);
  return {
    presets: ['babel-preset-expo'],
    plugins: [
      [
        'module-resolver',
        {
          root: ['./src'],
          extensions: ['.ts', '.tsx', '.js', '.json'],
          alias: {
            '@api': './src/api',
            '@hooks': './src/hooks',
            '@utils': './src/utils',
            '@assets': './src/assets',
            '@slices': './src/slices',
            '@routes': './src/routes',
            '@screens': './src/screens',
            '@database': './src/database',
            '@services': './src/services',
            '@contexts': './src/contexts',
            '@themes': './src/global/themes',
            '@interfaces': './src/interfaces',
            '@components': './src/components',
            '@stores': './src/stores',
          },
        },
      ],
      'react-native-reanimated/plugin',
    ],
  };
};
