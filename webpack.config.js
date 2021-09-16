const fs = require('fs');
const path = require('path');
const webpack = require('webpack');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const CaseSensitivePathsPlugin = require('case-sensitive-paths-webpack-plugin');
const TerserPlugin = require('terser-webpack-plugin');
const MiniCSSExtractPlugin = require('mini-css-extract-plugin');
const CSSMinimizerPlugin = require('css-minimizer-webpack-plugin');
const ESLintPlugin = require('eslint-webpack-plugin');
const ReactRefreshWebpackPlugin = require('@pmmmwh/react-refresh-webpack-plugin');
const CopyPlugin = require('copy-webpack-plugin');
const { createHash } = require('crypto');

module.exports = (_, { mode }) => {
  process.env.NODE_ENV = mode;
  process.env.BABEL_ENV = mode;

  return {
    target: ['browserslist'],
    mode,
    bail: mode === 'production',
    devtool: mode === 'development' && 'cheap-module-source-map',
    entry: path.resolve(process.cwd(), 'src/index.js'),
    devServer: {
      client: {
        overlay: false,
      },
      static: {
        directory: path.join(process.cwd(), 'public'),
      },
      compress: true,
      historyApiFallback: {
        disableDotRule: true,
        index: '/',
      },
    },
    output: {
      // The build folder.
      path: path.resolve(process.cwd(), 'build'),
      // Add /* filename */ comments to generated require()s in the output.
      pathinfo: mode === 'development',
      // There will be one main bundle, and one file per asynchronous chunk.
      // In development, it does not produce real files.
      filename:
        mode === 'production'
          ? 'static/js/[name].[contenthash:8].js'
          : 'static/js/bundle.js',
      // There are also additional JS chunk files for code splitting.
      chunkFilename:
        mode === 'production'
          ? 'static/js/[name].[contenthash:8].chunk.js'
          : 'static/js/[name].chunk.js',
      assetModuleFilename: 'static/media/[name].[hash][ext]',
      // Where the app is served from
      publicPath: '/',
      // Point sourcemap entries to original disk location (format as URL on Windows)
      devtoolModuleFilenameTemplate:
        mode === 'production'
          ? info =>
              path
                .relative(path.resolve(process.cwd(), 'src'), info.absoluteResourcePath)
                .replace(/\\/g, '/')
          : mode === 'development' &&
            (info => path.resolve(info.absoluteResourcePath).replace(/\\/g, '/')),
    },
    cache: {
      type: 'filesystem',
      version: createHash('md5').update(JSON.stringify(process.env)).digest('hex'),
      cacheDirectory: path.resolve(process.cwd(), 'node_modules/.cache'),
      store: 'pack',
      buildDependencies: {
        defaultWebpack: ['webpack/lib/'],
        config: [__filename],
        tsconfig: [path.resolve(process.cwd(), 'jsconfig.js')].filter(f =>
          fs.existsSync(f)
        ),
      },
    },
    infrastructureLogging: {
      level: 'none',
    },
    optimization: {
      minimize: mode === 'production',
      minimizer: [
        new TerserPlugin({
          terserOptions: {
            parse: {
              ecma: 8,
            },
            compress: {
              ecma: 5,
              warnings: false,
              comparisons: false,
              inline: 2,
            },
            mangle: {
              safari10: true,
            },
            output: {
              ecma: 5,
              comments: false,
              ascii_only: true,
            },
          },
        }),
        new CSSMinimizerPlugin(),
      ],
    },
    resolve: {
      modules: [
        'node_modules',
        path.resolve(process.cwd(), 'node_modules'),
        path.resolve(process.cwd(), 'src'),
      ],
      extensions: ['.js', '.json'],
    },
    module: {
      strictExportPresence: true,
      rules: [
        {
          oneOf: [
            {
              test: /\.(jpe?g|png)$/,
              type: 'asset',
              parser: {
                dataUrlCondition: {
                  maxSize: 10000,
                },
              },
            },
            {
              test: /\.svg$/,
              use: [
                {
                  loader: '@svgr/webpack',
                  options: {
                    prettier: false,
                    svgo: false,
                    svgoConfig: {
                      plugins: [{ removeViewBox: false }],
                    },
                    titleProp: true,
                    ref: true,
                  },
                },
                {
                  loader: 'file-loader',
                  options: {
                    name: 'static/media/[name].[hash].[ext]',
                  },
                },
              ],
              issuer: {
                and: [/\.(js|mdx?)$/],
              },
            },
            // Process application JS with Babel.
            {
              test: /\.js$/,
              exclude: /node_modules/,
              loader: require.resolve('babel-loader'),
              options: {
                customize: require.resolve('babel-preset-react-app/webpack-overrides'),
                presets: [
                  [
                    require.resolve('babel-preset-react-app'),
                    {
                      runtime: 'automatic',
                    },
                  ],
                ],
                plugins: [
                  mode === 'development' &&
                    process.env.STORYBOOK !== 'true' &&
                    require.resolve('react-refresh/babel'),
                ].filter(Boolean),
                cacheDirectory: true,
                cacheCompression: false,
                compact: mode === 'production',
              },
            },
            // Process any JS outside of the app with Babel.
            // Unlike the application JS, we only compile the standard ES features.
            {
              test: /\.(js|mjs)$/,
              exclude: /@babel(?:\/|\\{1,2})runtime/,
              loader: require.resolve('babel-loader'),
              options: {
                babelrc: false,
                configFile: false,
                compact: false,
                presets: [
                  [
                    require.resolve('babel-preset-react-app/dependencies'),
                    { helpers: true },
                  ],
                ],
                cacheDirectory: true,
                cacheCompression: false,
              },
            },
            {
              test: /\.css$/,
              use: [
                mode === 'development' && require.resolve('style-loader'),
                mode === 'production' && {
                  loader: MiniCSSExtractPlugin.loader,
                },
                {
                  loader: require.resolve('css-loader'),
                  options: {
                    importLoaders: 1,
                    sourceMap: !mode === 'production',
                  },
                },
                {
                  loader: require.resolve('postcss-loader'),
                  options: {
                    postcssOptions: {
                      ident: 'postcss',
                      plugins: [
                        'postcss-flexbugs-fixes',
                        [
                          'postcss-preset-env',
                          {
                            autoprefixer: {
                              flexbox: 'no-2009',
                            },
                            stage: 3,
                            features: {
                              'nesting-rules': true,
                              'custom-media-queries': {
                                importFrom: 'src/app/index.css',
                              },
                            },
                          },
                        ],
                        'postcss-normalize',
                      ],
                    },
                    sourceMap: !mode === 'production',
                  },
                },
              ].filter(Boolean),
              sideEffects: true,
            },
            {
              include: /\.glsl$/,
              type: 'asset/source',
            },
            {
              include: /\.(glb|mp4|woff2)/,
              type: 'asset/resource',
            },
          ],
        },
      ].filter(Boolean),
    },
    plugins: [
      // Generates an index.html file with the <script> injected.
      new HtmlWebpackPlugin({
        inject: true,
        template: path.resolve(process.cwd(), 'public/index.html'),
        minify:
          mode === 'production'
            ? {
                removeComments: true,
                collapseWhitespace: true,
                removeRedundantAttributes: true,
                useShortDoctype: true,
                removeEmptyAttributes: true,
                removeStyleLinkTypeAttributes: true,
                keepClosingSlash: true,
                minifyJS: true,
                minifyCSS: true,
                minifyURLs: true,
              }
            : undefined,
      }),
      // Makes some environment variables available to the JS code.
      new webpack.DefinePlugin({
        'process.env.': {
          NODE_ENV: process.env.NODE_ENV || 'development',
        },
      }),
      // Experimental hot reloading for React.
      mode === 'development' &&
        new ReactRefreshWebpackPlugin({
          overlay: false,
        }),
      mode === 'development' && new CaseSensitivePathsPlugin(),
      mode === 'production' &&
        new MiniCSSExtractPlugin({
          filename: 'static/css/[name].[contenthash:8].css',
          chunkFilename: 'static/css/[name].[contenthash:8].chunk.css',
        }),
      mode === 'production' &&
        new CopyPlugin({
          patterns: [{ from: 'public', filter: path => !path.endsWith('index.html') }],
        }),
      new ESLintPlugin({
        extensions: ['js'],
        formatter: require.resolve('react-dev-utils/eslintFormatter'),
        eslintPath: require.resolve('eslint'),
        context: path.resolve(process.cwd(), 'src'),
        cache: true,
        cacheLocation: path.resolve(process.cwd(), 'node_modules/.cache/.eslintcache'),
        cwd: path.resolve(process.cwd()),
        resolvePluginsRelativeTo: __dirname,
        baseConfig: {
          extends: [require.resolve('eslint-config-react-app/base')],
        },
      }),
    ].filter(Boolean),
  };
};
