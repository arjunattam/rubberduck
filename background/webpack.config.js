const webpack = require("webpack");
const path = require("path");

module.exports = {
  entry: {
    background: path.join(__dirname, "src/index.ts")
  },
  output: {
    path: path.join(__dirname, "../public/background"),
    filename: "index.js"
  },
  module: {
    rules: [
      {
        test: /\.tsx?$/,
        use: "ts-loader",
        exclude: /node_modules/
      }
    ]
  },
  resolve: {
    extensions: [".ts", ".tsx", ".js"]
  },
  plugins: [
    // exclude locale files in moment
    new webpack.IgnorePlugin(/^\.\/locale$/, /moment$/)
  ]
};
