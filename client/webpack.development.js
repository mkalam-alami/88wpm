const webpack = require('webpack')
const webpackMerge = require('webpack-merge')

const webpackCommon = require('./webpack.common')

module.exports = webpackMerge(webpackCommon, {
  mode: 'development',
  devtool: 'cheap-module-eval-source-map',
  plugins: [
    new webpack.DefinePlugin({
      'process.env': {
        NODE_ENV: JSON.stringify('development')
      }
    })
  ],
  watchOptions: {
    ignored: /node_modules/
  }
})
