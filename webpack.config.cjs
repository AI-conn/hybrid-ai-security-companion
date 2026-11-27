const path = require('path');
const CopyWebpackPlugin = require('copy-webpack-plugin');
const { CleanWebpackPlugin } = require('clean-webpack-plugin');

module.exports = {
  mode: 'production',
  entry: {
    'background': './src/background.js',
    'ui': './src/ui-entry.js',
  },
  output: {
    path: path.resolve(__dirname, 'dist'),
    filename: '[name].js',
  },
  resolve: {
    alias: {
      'firebase-config.json': path.resolve(__dirname, 'firebase-config.json'),
    },
  },
  module: {
    rules: [
      {
        test: /\.(js|ts)$/,
        exclude: /node_modules/,
        use: {
          loader: 'babel-loader',
          options: {
            presets: ['@babel/preset-env'],
          },
        },
      },
    ],
  },
  plugins: [
    new CleanWebpackPlugin(),
    new CopyWebpackPlugin({
      patterns: [
        { from: 'manifest.json', to: 'manifest.json' },
        { from: 'firebase-config.json', to: 'firebase-config.json' },
        { from: 'public/popup.html', to: 'popup.html' },
        { from: 'icons/', to: 'icons/' },
      ],
    }),
  ],
  optimization: { minimize: false },
};
