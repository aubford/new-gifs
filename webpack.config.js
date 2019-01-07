const HtmlWebpackPlugin = require("html-webpack-plugin")
const CleanWebpackPlugin = require("clean-webpack-plugin")
const path = require("path")

const outputDir = "dist/public"
module.exports = {
  devtool: "source-map",
  devServer: {
    historyApiFallback: true,
    hot: true,
    inline: true,
    port: 3000,
    proxy: {
      "/socket.io": { target: "http://localhost:5000", ws: true }
    }
  },
  entry: ["./src/client/index.tsx"],
  output: {
    filename: "bundle.js",
    path: path.join(__dirname, outputDir)
  },
  plugins: [
    new CleanWebpackPlugin([outputDir]),
    new HtmlWebpackPlugin({
      template: "./src/client/index.html"
    })
  ],
  resolve: {
    extensions: [".js", ".ts", ".tsx"]
  },
  module: {
    rules: [
      {
        test: /\.tsx?$/,
        use: "awesome-typescript-loader"
      },
      {
        test: /\.css$/,
        use: ["style-loader", "css-loader"]
      },
      {
        test: /\.(png|jpeg|jpg|gif)$/,
        use: "file-loader"
      },
      {
        test: /\.(eot|woff|woff2|ttf)$/,
        use: "url-loader?limit=30000"
      }
    ]
  }
}
