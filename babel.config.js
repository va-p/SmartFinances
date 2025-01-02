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
            '@stores': './src/stores',
            '@assets': './src/assets',
            '@routes': './src/routes',
            '@screens': './src/screens',
            '@database': './src/database',
            '@services': './src/services',
            '@contexts': './src/contexts',
            '@providers': './src/providers',
            '@themes': './src/global/themes',
            '@interfaces': './src/interfaces',
            '@components': './src/components',
          },
        },
      ],
      'react-native-reanimated/plugin',
    ],
  };
};
