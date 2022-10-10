/**
 * Base webpack config used across other specific configs
 */

import path from 'path';
import webpack from 'webpack';
const Dotenv = require('dotenv-webpack');
// import { dependencies } from '../package.json';

export default {
  // externals: [...Object.keys(dependencies || {})],
  externals: [
    {
      fsevents: "require('fsevents')"
    },
    {
      fswin: "require('fswin')"
    }
  ],

  module: {
    rules: [
      {
        test: /\.[jt]sx?$/,
        exclude: /node_modules/,
        // include: [/app/],
        use: [
          {
            loader: 'babel-loader',
            options: {
              cacheDirectory: true
            }
          },
          {
            loader: 'ts-loader',
            options: {
              transpileOnly: true,
              experimentalWatchApi: true
            }
          }
        ]
      }
    ]
  },

  output: {
    path: path.join(__dirname, '..', 'app'),
    // https://github.com/webpack/webpack/issues/1114
    libraryTarget: 'commonjs2',
    pathinfo: false
  },

  /**
   * Determine the array of extensions that should be used to resolve modules.
   */
  resolve: {
    extensions: ['.mjs', '.js', '.ts', '.tsx', '.json'],
    modules: [path.join(__dirname, '..', 'app'), 'node_modules']
  },

  cache: {
    type: 'filesystem',
    buildDependencies: {
      config: [__filename]
    }
  },

  plugins: [
    new webpack.EnvironmentPlugin({
      NODE_ENV: 'production'
    }),
    new Dotenv({
      path: path.join(
        __dirname,
        '..',
        'node_modules',
        '@tagspaces/tagspaces-common/default.env'
      )
    })
    // new webpack.NamedModulesPlugin()
  ]
};
