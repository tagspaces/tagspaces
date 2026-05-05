/**
 * Build config for web production build
 */

import CssMinimizerPlugin from 'css-minimizer-webpack-plugin';
import HtmlWebpackPlugin from 'html-webpack-plugin';
import MiniCssExtractPlugin from 'mini-css-extract-plugin';
import path from 'path';
import webpack from 'webpack';
import { BundleAnalyzerPlugin } from 'webpack-bundle-analyzer';
import merge from 'webpack-merge';
import baseConfig from './webpack.config.base';
import webpackPaths from './webpack.paths';

const configuration: webpack.Configuration = {
  devtool: 'source-map',
  mode: 'production',
  target: 'web',
  entry: path.join(webpackPaths.srcRendererPath, 'index.tsx'),

  output: {
    libraryTarget: 'window', // 'window', // 'commonjs2',
    path: path.join(__dirname, '../../web/dist'),
    publicPath: '../dist/',
    filename: 'bundle.js',
  },

  module: {
    rules: [
      {
        test: /\.css$/,
        use: [MiniCssExtractPlugin.loader, 'css-loader'],
        exclude: /\.module\.s?(c|a)ss$/,
      },
      // Extract all .global.css to style.css as is
      // {
      //   test: /\.global\.css$/,
      //   use: [
      //     {
      //       loader: MiniCssExtractPlugin.loader,
      //       options: {
      //         publicPath: './',
      //       },
      //     },
      //     {
      //       loader: 'css-loader',
      //       options: {
      //         sourceMap: true,
      //       },
      //     },
      //   ],
      // },
      // Pipe other styles through css modules and append to style.css
      // {
      //   test: /^((?!\.global).)*\.css$/,
      //   use: [
      //     {
      //       loader: MiniCssExtractPlugin.loader,
      //     },
      //     {
      //       loader: 'css-loader',
      //       options: {
      //         modules: {
      //           localIdentName: '[name]__[local]__[hash:base64:5]',
      //         },
      //         sourceMap: true,
      //       },
      //     },
      //   ],
      // },
      // Fonts
      {
        test: /\.(woff|woff2|eot|ttf|otf)$/i,
        type: 'asset/resource',
        generator: {
          filename: 'fonts/[hash][ext][query]',
        },
      },
      // Common Image Formats
      {
        test: /\.(?:ico|gif|png|jpg|jpeg|webp|avif|mp4|webm)$/,
        type: 'asset/resource',
      },
      {
        test: /\.m?js/,
        resolve: {
          fullySpecified: false,
        },
      },
      // Text files
      {
        test: /\.(txt)$/,
        use: 'raw-loader',
        type: 'javascript/auto',
      },
      // SVG
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
          'file-loader',
        ],
      },
    ],
  },

  optimization: {
    minimizer: process.env.E2E_BUILD
      ? []
      : [
          // For webpack@5 you can use the `...` syntax to extend existing minimizers (i.e. `terser-webpack-plugin`), uncomment the next line
          `...`,
          new CssMinimizerPlugin(),
          /*new OptimizeCSSAssetsPlugin({
            cssProcessorOptions: {
              map: {
                inline: false,
                annotation: true
              }
            }
          })*/
        ],
  },

  plugins: [
    new MiniCssExtractPlugin({
      filename: 'style.css',
    }),

    new HtmlWebpackPlugin({
      filename: path.join('index.html'),
      template: path.join(webpackPaths.srcRendererPath, '../../web/index.html'),
      minify: {
        collapseWhitespace: true,
        removeAttributeQuotes: true,
        removeComments: true,
      },
      isBrowser: false,
      env: process.env.NODE_ENV,
      isDevelopment: process.env.NODE_ENV !== 'production',
      nodeModules: webpackPaths.appNodeModulesPath,
    }),

    new BundleAnalyzerPlugin({
      analyzerMode:
        process.env.OPEN_ANALYZER === 'true' ? 'server' : 'disabled',
      openAnalyzer: process.env.OPEN_ANALYZER === 'true',
    }),
  ],
};

export default merge(baseConfig, configuration);
