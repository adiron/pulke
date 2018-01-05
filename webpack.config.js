const path = require('path');

const HtmlWebpackPlugin = require('html-webpack-plugin');
const HtmlWebpackPugPlugin = require('html-webpack-pug-plugin');
const UglifyJSPlugin = require('uglifyjs-webpack-plugin')

const webpack = require('webpack');

const deployDir = process.env.NODE_ENV === 'production' ? "dist/prod" : "dist/dev";

const config = {
  entry: { frontTest: './src/frontTest.ts', editor: './src/editor.ts' },
  devtool: 'inline-source-map',
  output: {
    path: path.resolve(__dirname, deployDir),
    filename: '[name].bundle.js'
  },
  resolve: {
    extensions: ['.ts', '.js']
  },
  devServer: {
    inline: true,
    progress: true,
    contentBase: './' + deployDir,
  },
  module: {
    rules: [
      {
        test: /\.scss$/, use:
        [{
          loader: "style-loader" // creates style nodes from JS strings
        }, {
          loader: "css-loader" // translates CSS into CommonJS
        }, {
          loader: "sass-loader" // compiles Sass to CSS
        }]
      }, {
        test: /\.jade$/,
        loader: 'jade-loader'
      },
      { test: /\.js$/, loader: 'babel-loader', exclude: /node_modules/ },
      { test: /\.jsx$/, loader: 'babel-loader', exclude: /node_modules/ },
      { test: /\.tsx?$/, loader: 'ts-loader', exclude: /node_modules/ }
    ]
  },
  plugins: [
    new HtmlWebpackPlugin({
      filename: 'frontTest.html',
      template: './src/frontTest.jade',
      inject: 'body',
    }),
    new HtmlWebpackPugPlugin(),
  ]
};

if (process.env.NODE_ENV === 'production') {
  config.plugins.push(
    new UglifyJSPlugin({
      parallel: true
    })
  )
}

module.exports = config;
