const webpackMerge = require('webpack-merge')
const UglifyjsWebpackPlugin = require('uglifyjs-webpack-plugin')
const webpack = require('webpack')

const webpackCommon = require('./webpack.common')

module.exports = webpackMerge(webpackCommon, {
  mode: 'production',
  devtool: 'source-map',
  plugins: [
    new webpack.DefinePlugin({
      'process.env': {
        NODE_ENV: JSON.stringify('production')
      }
    }),
    new UglifyjsWebpackPlugin({
      sourceMap: true
    }),
    new webpack.optimize.ModuleConcatenationPlugin()
  ]
})
