const path = require('path')

const rootPathTo = pathFromRoot => path.resolve(__dirname, pathFromRoot)

const outputPath = rootPathTo('../dist/client')

const babelOptions = {
  presets: [
    "@babel/typescript",
    [
      '@babel/preset-env',
      {
        useBuiltIns: 'usage',
        corejs: 'core-js@3',
        modules: false
      }
    ]
  ],
  sourceType: 'unambiguous'
}

module.exports = {
  entry: {
    site: './index.ts'
  },
  output: {
    path: outputPath,
    filename: '[name].js',
    publicPath: '/static/'
  },
  resolve: {
    extensions: ['.ts', '.tsx', '.js'],
    alias: {
      'vue$': 'vue/dist/vue.esm.js'
    }
  },
  module: {
    rules: [
      {
        test: /\.tsx?$/,
        include: rootPathTo('client'),
        use: [
          {
            loader: 'babel-loader',
            options: babelOptions
          }
        ]
      }
    ]
  },
  context: __dirname,
  target: 'web',
  // https://webpack.js.org/configuration/stats/
  stats: {
    chunks: false,
    colors: true,
    modules: false,
    performance: false,
    warnings: true
  }
}
