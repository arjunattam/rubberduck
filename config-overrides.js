const path = require("path");
const WriteFilePlugin = require("write-file-webpack-plugin");
const fs = require("fs-extra");

const helpers = require("./update-manifest");

module.exports = function override(config, env) {
  //do stuff with the webpack config...
  config.output.path = path.join(__dirname, "./build");
  config.plugins.push(new WriteFilePlugin());

  // Copy public folder to build folder
  fs.removeSync("./build/"); // to clear the asset-manifest.json file
  fs.copySync("./public/", "./build/");

  // Update manifest key to preserve extension id
  helpers.updateBackground();
  helpers.updateManifestKey();
  return config;
};
