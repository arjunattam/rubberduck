// Small script that reads the ./build/asset-manifest.json file
// and updates the ./build/background.js accordingly.
// From: https://github.com/facebook/create-react-app/issues/3805

const fs = require("fs");

const backgroundJS = "./build/background.js";
const jsPlaceholder = "JS_ASSET_LOCATION";
const cssPlaceholder = "CSS_ASSET_LOCATION";
const assetManifest = "./build/asset-manifest.json";

const assetContents = JSON.parse(fs.readFileSync(assetManifest, "utf8"));
var backgroundContents = fs.readFileSync(backgroundJS, "utf8");

// Replace placeholder with actual values
backgroundContents = backgroundContents.replace(
  jsPlaceholder,
  '"./' + assetContents["main.js"] + '"'
);

backgroundContents = backgroundContents.replace(
  cssPlaceholder,
  '"./' + assetContents["main.css"] + '"'
);

// Write back the corrected script
fs.writeFile(backgroundJS, backgroundContents, function(err) {
  if (err) {
    return console.log(err);
  }

  console.log("background.js updated.");
});
