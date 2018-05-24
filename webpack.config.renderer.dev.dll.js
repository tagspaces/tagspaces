/**
 * Builds the DLL for development electron renderer process
 */

import webpack from 'webpack';
import path from 'path';
import merge from 'webpack-merge';
import baseConfig from './webpack.config.base';
import { dependencies } from './package.json';

const dist = path.resolve(process.cwd(), 'dll');

export default merge.smart(baseConfig, {
  context: process.cwd(),

  devtool: 'eval',

  target: 'electron-renderer',

  externals: ['fsevents', 'crypto-browserify'],

  /**
   * @HACK: Copy and pasted from renderer dev config. Consider merging these
   *        rules into the base config. May cause breaking changes.
   */
  module: {
    rules: [
      {
        test: /\.global\.css$/,
        use: [
          {
            loader: 'style-loader'
          },
          {
            loader: 'css-loader',
            options: {
              sourceMap: true,
            },
          }
        ]
      },
      {
        test: /^((?!\.global).)*\.css$/,
        use: [
          {
            loader: 'style-loader'
          },
          {
            loader: 'css-loader',
            options: {
              modules: true,
              sourceMap: true,
              importLoaders: 1,
              localIdentName: '[name]__[local]__[hash:base64:5]',
            }
          },
        ]
      },
      // Add SASS support  - compile all .global.scss files and pipe it to style.css
      {
        test: /\.global\.scss$/,
        use: [
          {
            loader: 'style-loader'
          },
          {
            loader: 'css-loader',
            options: {
              sourceMap: true,
            },
          },
          {
            loader: 'sass-loader'
          }
        ]
      },
      // Add SASS support  - compile all other .scss files and pipe it to style.css
      {
        test: /^((?!\.global).)*\.scss$/,
        use: [
          {
            loader: 'style-loader'
          },
          {
            loader: 'css-loader',
            options: {
              modules: true,
              sourceMap: true,
              importLoaders: 1,
              localIdentName: '[name]__[local]__[hash:base64:5]',
            }
          },
          {
            loader: 'sass-loader'
          }
        ]
      },
      // Fonts
      {
        test: /\.(woff|woff2|eot|ttf)$/,
        use: [{
          loader: 'file-loader'
        }]
      },
      // Common Image Formats
      {
        test: /\.(?:ico|gif|png|jpg|jpeg|webp|svg)$/,
        use: 'url-loader',
      }
    ]
  },

  resolve: {
    modules: [
      'app',
    ],
  },

  entry: {
    vendor: [
      'babel-polyfill',
      ...Object.keys(dependencies || {})
    ]
    .filter(dependency => dependency !== 'font-awesome'),
  },

  output: {
    library: 'vendor',
    path: dist,
    filename: '[name].dll.js',
    libraryTarget: 'var'
  },

  plugins: [
    new webpack.DllPlugin({
      path: path.join(dist, '[name].json'),
      name: '[name]',
    }),

    /**
     * Create global constants which can be configured at compile time.
     *
     * Useful for allowing different behaviour between development builds and
     * release builds
     *
     * NODE_ENV should be production so that modules do not perform certain
     * development checks
     */
    new webpack.DefinePlugin({
      'process.env.NODE_ENV': JSON.stringify(process.env.NODE_ENV || 'development')
    }),

    new webpack.LoaderOptionsPlugin({
      debug: true,
      options: {
        context: path.resolve(process.cwd(), 'app'),
        output: {
          path: path.resolve(process.cwd(), 'dll'),
        },
      },
    })
  ],
});
