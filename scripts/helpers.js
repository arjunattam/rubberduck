/*
Helper script for two tasks:

1. Update asset (css/js) asset locations inside `build/background.js`.
   For context, see https://github.com/facebook/create-react-app/issues/3805

2. Update public key value inside `build/manifest.json` to maintain
   extension id during development. See: https://developer.chrome.com/apps/app_identity#copy_key

These methods are called during `npm run start` and `npm run build`.
*/

const fs = require("fs");
const manifestKey =
  "MIIBIjANBgkqhkiG9w0BAQEFAAOCAQ8AMIIBCgKCAQEAySpRY2cTq3UzJE4KA9CtM1gkIrpvu/1NNT3yvN1hv76HYTORjUb1lZg73jm08oNo/5xE0asG77LP5h4Z/NeXU5KyQyvDUyyLvhcuR10OmqVCLCZ2XJhcK/eJgm89xwYgrt+RDQ7R6xoL75TUptHbksCrLj++qXET/JEDqDWFg3lX/BYa9tug6x5Fwpf7Ohrkes3nvHcg9ShbJxx9/CDl5Gyt6e0kN7YaLhoqJj6dBF8Cnu9fMZAKrMGLFO7HoP7Q3dnYHnroMnl5/7lB3BGyrl53T2nmkxuXPw3vKOjdN9r99NqEda4nGdshnXLPZz8M8/EmHKNo432Bn0ncdjY7DQIDAQAB";
const localManifestKey =
  "MIIBIjANBgkqhkiG9w0BAQEFAAOCAQ8AMIIBCgKCAQEAlN56sx9mTFsM9qnbym1SLbO2BVyy0ilA75ja9ljoA6CpriYm0uYqY4s6KAQv2v7vZPSelxw+wy3W+HK1yGy+RXcidTtiCb7orVyoiFS2dCwb+g5QsqAyPV+cW3rYv+safbYLPbfHkPnBpSjSvop3BixQz5+//S9p4iqAZqUWfa6Op9NiQ5VaICl/gJeF4rOJGvwLO2D5XoHl24L/q3UZJ+eLUbOyIhY03Qcs25n4rzpq21EfM3lYOZi8xq4Hp89TFQGG63tSrE8xXKiZsHK29K/SJw+cYr74cFUiPwlXA9LA0rZR9Zw0GwvqBSoOoCuDqHGDXBoffdtsLwSgGWSZQwIDAQAB";

// Replace placeholder with actual values
const updateBackground = buildPath => {
  const backgroundJS = `${buildPath}/background.js`;
  const jsPlaceholder = "JS_ASSET_LOCATION";
  const cssPlaceholder = "CSS_ASSET_LOCATION";
  const assetManifest = `${buildPath}/asset-manifest.json`;
  // Get contents to override
  let jsLocation = '"./static/js/bundle.js"';
  let cssLocation = "null";

  if (fs.existsSync(assetManifest)) {
    const assetContents = JSON.parse(fs.readFileSync(assetManifest, "utf8"));
    jsLocation = '"./' + assetContents["main.js"] + '"';
    cssLocation = '"./' + assetContents["main.css"] + '"';
  }

  let backgroundContents = fs.readFileSync(backgroundJS, "utf8");
  backgroundContents = backgroundContents.replace(jsPlaceholder, jsLocation);
  backgroundContents = backgroundContents.replace(cssPlaceholder, cssLocation);

  // Write back the corrected script
  fs.writeFile(backgroundJS, backgroundContents, function(err) {
    if (err) {
      return console.log(err);
    }
    console.log("background.js updated.");
  });
};

const getGitBranch = () => {
  return require("child_process")
    .execSync("git rev-parse --abbrev-ref HEAD", { encoding: "utf-8" })
    .replace(/\s+/, "");
};

const updateManifestKey = buildPath => {
  // Add manifest key to the manifest.json file so that we
  // preserve extension id during development cycles
  // From: https://developer.chrome.com/apps/app_identity#copy_key
  const manifest = `${buildPath}/manifest.json`;
  let manifestContents = JSON.parse(fs.readFileSync(manifest, "utf8"));
  manifestContents.version_name =
    manifestContents.version + " " + getGitBranch();

  if (process.env.REACT_APP_BACKEND_ENV === "local") {
    manifestContents.name = "Rubberduck-local";
    manifestContents.key = localManifestKey;
  } else {
    manifestContents.name = "Rubberduck-development";
    manifestContents.key = manifestKey;
  }

  // Write back new object
  fs.writeFile(manifest, JSON.stringify(manifestContents), function(err) {
    if (err) {
      return console.log(err);
    }

    console.log("manifest.json updated.");
  });
};

module.exports = {
  updateManifestKey: updateManifestKey,
  updateBackground: updateBackground
};

if (require.main === module) {
  // If this script is called as `node ...`, call these methods
  const buildPath = "./build";
  updateBackground(buildPath);

  if (process.env.REACT_APP_CHROME_ZIP !== "true") {
    // We don't update the key in the manifest if the script is
    // run for chrome store zip file
    updateManifestKey(buildPath);
  }
}
