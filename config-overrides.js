/*
Overiding webpack config for create-react-app, to run our custom
helpers and also force the dev server to save the served files to
disk, so that Chrome can serve them.

Related: https://github.com/facebook/create-react-app/issues/1070
         https://github.com/gajus/write-file-webpack-plugin
*/
const path = require("path");
const WriteFilePlugin = require("write-file-webpack-plugin");
const fs = require("fs-extra");

const helpers = require("./scripts/helpers");

module.exports = function override(config, env) {
  // Add plugin to write files to disk from webpack dev server
  let buildPath = "./build";

  if (process.env.REACT_APP_BACKEND_ENV === "local") {
    buildPath = "./build-local";
  }

  // Write webpack output to file for chrome loading
  config.output.path = path.join(__dirname, buildPath);
  config.plugins.push(new WriteFilePlugin());

  // Copy public folder to build folder
  fs.removeSync(buildPath); // to clear the asset-manifest.json file
  fs.copySync("./public/", buildPath);

  // Run helper scripts
  helpers.updateBackground(buildPath);
  helpers.updateManifestKey(buildPath);

  // Add localhost to the manifest permissions on local
  if (process.env.REACT_APP_BACKEND_ENV === "local") {
    helpers.updateManifestForLocalhost(buildPath);
  }

  // Modules resolve config
  config.resolve.modules = [
    path.resolve(__dirname, "src/components"),
    "node_modules"
  ];

  // All config manipulation is complete
  return config;
};
