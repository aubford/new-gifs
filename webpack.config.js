module.exports = {
  devServer: {
    contentBase: './dist'
  },
  module: {
    rules: [
      {
        test: /\.js$/,
        exclude: /node_modules/,
        use: {
          loader: "babel-loader"
        }
      },
      {
        test: /\.css$/, use: ['style-loader', 'css-loader']
      },
      {
        test: /\.(png|jp?g|gif)$/, use: [
          {
            loader: 'file-loader', options: {}
          }
        ]
      },
      {
        test: /\.(eot|woff|woff2|ttf)$/, use: 'url-loader?limit=30000'
      }
    ]
  }
}