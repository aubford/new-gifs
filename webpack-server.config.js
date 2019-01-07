const path = require("path")
const nodeExternals = require('webpack-node-externals')

const outputDir = "dist"
module.exports = {
  mode: 'production',
  entry: ["./production/serve-html.js"],
  output: {
    filename: "server-bundle.js",
    path: path.join(__dirname, outputDir)
  },
  resolve: {
    extensions: [".js", ".ts"]
  },
  externals: [nodeExternals()],
  target: "node",
  node: {
    global: false,
    process: false,
    __filename: false,
    __dirname: false,
    Buffer: false,
    setImmediate: false
  },
  module: {
    rules: [
      {
        test: /\.ts$/,
        exclude: /node_modules/,
        use: "awesome-typescript-loader"
      },
      {
        test: /\.js$/,
        exclude: /node_modules/,
        use: {
          loader: "babel-loader"
        }
      }
    ]
  }
}
