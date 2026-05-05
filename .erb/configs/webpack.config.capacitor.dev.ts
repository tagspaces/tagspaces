/**
 * Build config for Capacitor development
 */

import HtmlWebpackPlugin from 'html-webpack-plugin';
import MiniCssExtractPlugin from 'mini-css-extract-plugin';
import path from 'path';
import webpack from 'webpack';
import { BundleAnalyzerPlugin } from 'webpack-bundle-analyzer';
import merge from 'webpack-merge';
import baseConfig from './webpack.config.base';
import webpackPaths from './webpack.paths';

const configuration: webpack.Configuration = {
  cache: false,
  devtool: 'inline-source-map',
  mode: 'development',
  target: 'web',
  entry: path.join(webpackPaths.srcRendererPath, 'index.tsx'),

  output: {
    libraryTarget: 'window',
    path: path.join(__dirname, '../../capacitor/www/dist'),
    publicPath: './dist/',
    filename: 'bundle.js',
    sourceMapFilename: '[file].map',
  },

  module: {
    rules: [
      {
        test: /\.css$/,
        use: ['style-loader', 'css-loader'],
        exclude: /\.module\.s?(c|a)ss$/,
      },
      // WOFF Font
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

  plugins: [
    new MiniCssExtractPlugin({
      filename: 'style.css',
    }),

    new HtmlWebpackPlugin({
      filename: path.join('index.html'),
      template: path.join(webpackPaths.srcRendererPath, 'index.ejs'),
      templateParameters: {
        csp: "connect-src * https: http: ws: wss: capacitor: blob: data:; frame-src * 'self' https: capacitor: blob: data:; default-src 'self' capacitor: https: data: blob: gap:; object-src 'none'; font-src 'self' data:; script-src 'self' 'unsafe-inline' 'unsafe-eval'; style-src 'self' 'unsafe-inline' data: blob:; media-src * blob: data: capacitor:; img-src * blob: data: content: capacitor: https: http:;",
      },
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
