const webpack = require('webpack');
const TerserPlugin = require('terser-webpack-plugin');

module.exports = {
  mode: 'production',
  //entry: '', // gulpで設定
  entry: {
    'bundle': './src/asset/js/app.js',
  },
  module: {
    rules: [
      {
        test: /\.js$/,
        use: {
          loader: 'babel-loader',
          options: {
            'presets': [
              ["@babel/preset-env"]
            ],
            'compact': false
          }
        },
      }
    ]
  },
  plugins: [
    // ファイルを分割しない
    new webpack.optimize.LimitChunkCountPlugin({
      maxChunks: 1,
    }),
  ],
  optimization: {
    minimize: true, // ファイル圧縮機能を有効にする
    minimizer: [
      new TerserPlugin({
        extractComments: false, // コメントを外部ファイルにしない
        terserOptions: {
          compress: {
            drop_console: false,  // console.logを残す
          }
        },
      }),
    ],
  },
  performance: {
    hints: false // パフォーマンス警告を表示しない
  },
  resolve: {
    extensions: ['.js']
  }
}