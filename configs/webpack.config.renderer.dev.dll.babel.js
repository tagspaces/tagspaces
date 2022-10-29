/* eslint global-require: off, import/no-dynamic-require: off */

/**
 * Builds the DLL for development electron renderer process
 */

import webpack from 'webpack';
import path from 'path';
import merge from 'webpack-merge';
import baseConfig from './webpack.config.base';
import { dependencies } from '../package.json';
// import CheckNodeEnv from '../internals/scripts/CheckNodeEnv';

// CheckNodeEnv('development');

const targetPlatform = 'electron-io'; // electron-io | webdav-io | cordova-io | process.env.APP_TARGET ||

const dist = path.join(__dirname, '..', 'dll');

export default merge(baseConfig, {
  cache: false,
  context: path.join(__dirname, '..'),

  devtool: 'eval',

  mode: 'development',

  target: 'electron-renderer',

  externals: ['fsevents', 'crypto-browserify'],

  /**
   * Use `module` from `webpack.config.renderer.dev.js`
   */
  module: require('./webpack.config.renderer.dev.babel').default.module,

  entry: {
    renderer: Object.keys(dependencies || {})
  },

  output: {
    library: 'renderer',
    path: dist,
    filename: '[name].dev.dll.js',
    libraryTarget: 'var'
  },

  plugins: [
    new webpack.DllPlugin({
      path: path.join(dist, '[name].json'),
      name: '[name]'
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
    new webpack.EnvironmentPlugin({
      NODE_ENV: 'development'
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

    /* new webpack.NormalModuleReplacementPlugin(
      /(.*)_PDFDISTLIB_(\.*)/,
      resource => {
        resource.request = resource.request.replace(
          /_PDFDISTLIB_/,
          `pdfjs-dist/webpack`
        );
      }
    ), */

    new webpack.LoaderOptionsPlugin({
      debug: true,
      options: {
        context: path.join(__dirname, '..', 'app'),
        output: {
          path: path.join(__dirname, '..', 'dll')
        }
      }
    })
  ]
});
