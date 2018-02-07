// Small script that reads the ./build/asset-manifest.json file
// and updates the ./build/background.js accordingly.
// From: https://github.com/facebook/create-react-app/issues/3805

const fs = require("fs");
const backgroundJS = "./build/background.js";
const jsPlaceholder = "JS_ASSET_LOCATION";
const cssPlaceholder = "CSS_ASSET_LOCATION";
const assetManifest = "./build/asset-manifest.json";
const manifest = "./build/manifest.json";

// Get contents to override
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

const manifestKey =
  "MIIBIjANBgkqhkiG9w0BAQEFAAOCAQ8AMIIBCgKCAQEAySpRY2cTq3UzJE4KA9CtM1gkIrpvu/1NNT3yvN1hv76HYTORjUb1lZg73jm08oNo/5xE0asG77LP5h4Z/NeXU5KyQyvDUyyLvhcuR10OmqVCLCZ2XJhcK/eJgm89xwYgrt+RDQ7R6xoL75TUptHbksCrLj++qXET/JEDqDWFg3lX/BYa9tug6x5Fwpf7Ohrkes3nvHcg9ShbJxx9/CDl5Gyt6e0kN7YaLhoqJj6dBF8Cnu9fMZAKrMGLFO7HoP7Q3dnYHnroMnl5/7lB3BGyrl53T2nmkxuXPw3vKOjdN9r99NqEda4nGdshnXLPZz8M8/EmHKNo432Bn0ncdjY7DQIDAQAB";

// Add manifest key to the manifest.json file so that we
// preserve extension id during development cycles
// From: https://developer.chrome.com/apps/app_identity#copy_key
var manifestContents = JSON.parse(fs.readFileSync(manifest, "utf8"));
manifestContents.key = manifestKey;
// Write back new object
fs.writeFile(manifest, JSON.stringify(manifestContents), function(err) {
  if (err) {
    return console.log(err);
  }

  console.log("manifest.json updated.");
});
