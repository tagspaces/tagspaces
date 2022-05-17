/**
 * Base webpack config used across other specific configs
 */

import path from 'path';
import webpack from 'webpack';

const { ESBuildPlugin } = require('esbuild-loader');
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
            loader: 'esbuild-loader',
            options: {
              loader: 'tsx', // Or 'ts' if you don't need tsx
              tsconfigRaw: require('../tsconfig.esbuild.json'),
              target: 'es2015'
            }
          }
        ]
      }
      /* {
        test: /\.css$/i,
        use: [
          'style-loader',
          'css-loader',
          {
            loader: 'esbuild-loader',
            options: {
              loader: 'css',
              minify: true
            }
          }
        ]
      } */
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

  plugins: [
    new webpack.EnvironmentPlugin({
      NODE_ENV: 'production'
    }),
    new ESBuildPlugin()
    // new webpack.NamedModulesPlugin()
  ]
};
