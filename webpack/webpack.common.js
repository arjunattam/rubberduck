const webpack = require("webpack");
const path = require("path");

module.exports = {
  entry: {
    background: path.join(__dirname, "../src/background/index.ts"),
    content_script: path.join(__dirname, "../src/content_script/index.js"),
    options: path.join(__dirname, "../src/options/index.tsx")
  },
  output: {
    path: path.join(__dirname, "../public/js"),
    filename: "[name].js"
  },
  optimization: {
    splitChunks: {
      name: "vendor",
      chunks: "initial"
    }
  },
  module: {
    rules: [
      {
        test: /\.tsx?$/,
        use: "awesome-typescript-loader",
        exclude: /node_modules/
      },
      {
        test: /\.(js|jsx)$/,
        exclude: /(node_modules|bower_components)/,
        loader: "babel-loader",
        options: { presets: ["@babel/env"] }
      },
      {
        test: /\.css$/,
        use: ["style-loader", "css-loader"]
      }
    ]
  },
  resolve: {
    extensions: ["*", ".ts", ".tsx", ".js", ".jsx"]
  },
  plugins: [
    // exclude locale files in moment
    new webpack.IgnorePlugin(/^\.\/locale$/, /moment$/)
  ]
};
