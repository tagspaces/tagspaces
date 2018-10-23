/**
 * Base webpack config used across other specific configs
 */

import path from 'path';
import webpack from 'webpack';
// import { dependencies as externals } from './app/package.json';

export default {
  // externals: Object.keys(externals || {}),

  module: {
    rules: [{
      test: /\.jsx?$/,
      // exclude: path.resolve(__dirname, '/node_modules/'),
      // exclude: /node_modules/,
      include: [
        /app/
      ],
      use: {
        loader: 'babel-loader',
        options: {
          cacheDirectory: true
        }
      }
    }]
  },

  output: {
    path: path.join(__dirname, 'app'),
    filename: 'bundle.js',
    // https://github.com/webpack/webpack/issues/1114
    libraryTarget: 'commonjs2',
    // publicPath: 'dist/',
  },

  /**
   * Determine the array of extensions that should be used to resolve modules.
   */
  resolve: {
    extensions: ['.js', '.jsx', '.json'],
    modules: [
      path.join(__dirname, 'app'),
      'node_modules',
    ],
    symlinks: false,
    /* alias: {
      "react": "preact-compat",
      "react-dom": "preact-compat"
    } */
  },

  plugins: [
    new webpack.NamedModulesPlugin(),
  ],
};
