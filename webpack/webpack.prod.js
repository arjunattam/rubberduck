const webpack = require("webpack");
const merge = require("webpack-merge");
const UglifyJSPlugin = require("uglifyjs-webpack-plugin");
const WebpackShellPlugin = require("webpack-shell-plugin");
const common = require("./webpack.common.js");

module.exports = merge(common, {
  mode: "production",
  optimization: {
    minimize: false // Disabling uglify to fix utf-8 error on Chrome
  },
  plugins: [
    new WebpackShellPlugin({
      onBuildStart: ["cp public/manifest.template.json public/manifest.json"]
    })
  ]
});
