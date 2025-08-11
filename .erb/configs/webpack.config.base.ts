/**
 * Base webpack config used across other specific configs
 */

import webpack from 'webpack';
const Dotenv = require('dotenv-webpack');
import TsconfigPathsPlugins from 'tsconfig-paths-webpack-plugin';
import webpackPaths from './webpack.paths';
import { dependencies as externals } from '../../release/app/package.json';
//import NodePolyfillPlugin from 'node-polyfill-webpack-plugin';
import path = require('path');
import { TsMetaPlugin } from '../../plugins/TsMetaPlugin';

const configuration: webpack.Configuration = {
  // packages that is not included in the bundle
  externals: [
    ...Object.keys(externals || {}),
    {
      fsevents: "require('fsevents')",
    },
    /*
    {
      fswin: "require('fswin')",
    },*/
    /*{
      fs: "require('fs')",
    },
    {
      'fs-extra': "require('fs-extra')",
    },
    {
      'graceful-fs': "require('graceful-fs')",
    },
    {
      'child-process': "require('child-process')",
    },*/
  ],

  stats: 'errors-only',

  module: {
    rules: [
      {
        test: /\.[jt]sx?$/,
        exclude: /node_modules\/(?!(@tagspacespro)\/).*/,
        use: {
          loader: 'ts-loader',
          options: {
            // Remove this line to enable type checking in webpack builds
            transpileOnly: true,
            // experimentalWatchApi: true,
            compilerOptions: {
              module: 'esnext',
            },
          },
        },
      },
    ],
  },

  output: {
    path: webpackPaths.srcPath,
    // https://github.com/webpack/webpack/issues/1114
    library: {
      type: 'commonjs2',
    },
    // globalObject: 'this',
  },

  /**
   * Determine the array of extensions that should be used to resolve modules.
   */
  resolve: {
    extensions: ['.js', '.jsx', '.json', '.ts', '.tsx'],
    modules: [webpackPaths.srcPath, 'node_modules'],
    // There is no need to add aliases here, the paths in tsconfig get mirrored
    plugins: [new TsconfigPathsPlugins()],
  },

  plugins: [
    new webpack.EnvironmentPlugin({
      NODE_ENV: 'production',
    }),
    new Dotenv({
      path: path.join(
        __dirname,
        '..',
        '..',
        'node_modules',
        '@tagspaces/tagspaces-common/default.env',
      ),
    }),
    //new NodePolyfillPlugin(),
    new TsMetaPlugin(),
  ],
};

export default configuration;
