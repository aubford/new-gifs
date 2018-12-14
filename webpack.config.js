const HtmlWebpackPlugin = require('html-webpack-plugin')
const CleanWebpackPlugin = require('clean-webpack-plugin')
const path = require('path')

const outputDir = 'dist'
module.exports = {
  // devtool: 'source-map',
  devServer: {
    // historyApiFallback: true,
    // hot: true,
    // inline: true,
    port: 3000,
    proxy: {
      '/socket.io': { target: 'http://localhost:5000', ws: true }
    }
  },
  entry: ['./src/client/index.js'],
  output: {
    filename: 'bundle.js',
    path: path.join(__dirname, outputDir)
  },
  plugins: [
    new CleanWebpackPlugin([outputDir]),
    new HtmlWebpackPlugin({
      template: './public/index.html'
    })
  ],
  module: {
    rules: [
      {
        test: /\.js$/,
        exclude: /node_modules/,
        use: {
          loader: 'babel-loader'
        }
      },
      {
        test: /\.css$/,
        use: ['style-loader', 'css-loader']
      },
      {
        test: /\.(png|jp?g|gif)$/,
        use: [
          {
            loader: 'file-loader',
            options: {}
          }
        ]
      },
      {
        test: /\.(eot|woff|woff2|ttf)$/,
        use: 'url-loader?limit=30000'
      }
    ]
  }
}
