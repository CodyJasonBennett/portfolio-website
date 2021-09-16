const MiniCSSExtractPlugin = require('mini-css-extract-plugin');
const createConfig = require('../webpack.config.js');

module.exports = {
  core: {
    builder: 'webpack5',
  },
  addons: [
    '@storybook/addon-actions',
    '@storybook/addon-controls',
    '@storybook/addon-a11y',
    '@storybook/addon-toolbars',
  ],
  stories: ['../src/**/*.stories.js'],
  webpackFinal(config, { configType }) {
    process.env.STORYBOOK = true;

    const mode = configType.toLowerCase();
    const webpackConfig = createConfig(null, { mode });

    return {
      ...config,
      module: {
        ...config.module,
        rules: webpackConfig.module.rules,
      },
      resolve: {
        ...config.resolve,
        modules: [...config.resolve.modules, ...webpackConfig.resolve.modules],
      },
      plugins: [
        ...config.plugins,
        mode === 'production' &&
          new MiniCSSExtractPlugin({
            filename: 'static/css/[name].[contenthash:8].css',
            chunkFilename: 'static/css/[name].[contenthash:8].chunk.css',
          }),
      ].filter(Boolean),
    };
  },
};
