/**
 * Build config for electron renderer process
 */

import path from 'path';
import webpack from 'webpack';
import HtmlWebpackPlugin from 'html-webpack-plugin';
import MiniCssExtractPlugin from 'mini-css-extract-plugin';
// import OptimizeCSSAssetsPlugin from 'optimize-css-assets-webpack-plugin';
import { BundleAnalyzerPlugin } from 'webpack-bundle-analyzer';
import merge from 'webpack-merge';
//import NodePolyfillPlugin from 'node-polyfill-webpack-plugin';
import baseConfig from './webpack.config.base';
import webpackPaths from './webpack.paths';
// import CheckNodeEnv from '../internals/scripts/CheckNodeEnv';

const targetPlatform = 'webdav-io'; // electron-io | webdav-io | cordova-io | process.env.APP_TARGET ||

// CheckNodeEnv('production');
const configuration: webpack.Configuration = {
  cache: false,
  devtool: 'inline-source-map',

  mode: 'development',

  target: 'web',

  //entry: path.join(__dirname, '..', 'app/index'),
  entry: path.join(webpackPaths.srcRendererPath, 'index.tsx'),
  // entry: ['babel-polyfill', './app/index'],

  output: {
    libraryTarget: 'window', // 'window', // 'commonjs2',
    path: path.join(__dirname, '../../web/dist'),
    publicPath: '../dist/',
    filename: 'bundle.js',
  },

  /*node: {
    fs: 'empty',
    child_process: 'empty'
  },*/

  module: {
    rules: [
      // Extract all .global.css to style.css as is
      {
        test: /\.global\.css$/,
        use: [
          {
            loader: MiniCssExtractPlugin.loader,
            options: {
              publicPath: './',
            },
          },
          {
            loader: 'css-loader',
            options: {
              sourceMap: true,
            },
          },
        ],
      },
      // Pipe other styles through css modules and append to style.css
      {
        test: /^((?!\.global).)*\.css$/,
        use: [
          {
            loader: MiniCssExtractPlugin.loader,
          },
          {
            loader: 'css-loader',
            options: {
              modules: {
                localIdentName: '[name]__[local]__[hash:base64:5]',
              },
              sourceMap: true,
            },
          },
        ],
      },
      // Add SASS support  - compile all .global.scss files and pipe it to style.css
      {
        test: /\.global\.(scss|sass)$/,
        use: [
          {
            loader: MiniCssExtractPlugin.loader,
          },
          {
            loader: 'css-loader',
            options: {
              sourceMap: true,
              importLoaders: 1,
            },
          },
          {
            loader: 'sass-loader',
            options: {
              sourceMap: true,
            },
          },
        ],
      },
      // Add SASS support  - compile all other .scss files and pipe it to style.css
      {
        test: /^((?!\.global).)*\.(scss|sass)$/,
        use: [
          {
            loader: MiniCssExtractPlugin.loader,
          },
          {
            loader: 'css-loader',
            options: {
              modules: {
                localIdentName: '[name]__[local]__[hash:base64:5]',
              },
              importLoaders: 1,
              sourceMap: true,
            },
          },
          {
            loader: 'sass-loader',
            options: {
              sourceMap: true,
            },
          },
        ],
      },
      // WOFF Font
      {
        test: /\.(woff|woff2|eot|ttf|otf)$/i,
        type: 'asset/resource',
        generator: {
          filename: 'fonts/[hash][ext][query]',
        },
      },
      // SVG Font
      /*{
        test: /\.svg(\?v=\d+\.\d+\.\d+)?$/,
        use: {
          loader: 'url-loader',
          options: {
            limit: 10000,
            mimetype: 'image/svg+xml',
          },
        },
        type: 'javascript/auto',
      },*/

      // Common Image Formats
      {
        test: /\.(?:ico|gif|png|jpg|jpeg|webp)$/,
        type: 'asset/resource',
      },
      {
        // https://github.com/microsoft/PowerBI-visuals-tools/issues/365#issuecomment-1099716186
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

  plugins: [
    //new NodePolyfillPlugin(),

    new MiniCssExtractPlugin({
      filename: 'style.css',
    }),

    /* new webpack.NormalModuleReplacementPlugin(
      /(.*)_PLATFORMIO_(\.*)/,
      resource => {
        resource.request = resource.request.replace(
          /_PLATFORMIO_/,
          `${targetPlatform}`
        );
      }
    ), */

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
    /* new webpack.NormalModuleReplacementPlugin(
      /(.*)_PDFDISTLIB_(\.*)/,
      resource => {
        resource.request = resource.request.replace(
          /_PDFDISTLIB_/,
          `pdfjs-dist`
        );
      }
    ), */

    new BundleAnalyzerPlugin({
      analyzerMode:
        process.env.OPEN_ANALYZER === 'true' ? 'server' : 'disabled',
      openAnalyzer: process.env.OPEN_ANALYZER === 'true',
    }),
  ],
};

export default merge(baseConfig, configuration);
