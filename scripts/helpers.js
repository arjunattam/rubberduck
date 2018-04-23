/*
Helper script for two tasks:

1. Update asset (css/js) asset locations inside `build/background.js`.
   For context, see https://github.com/facebook/create-react-app/issues/3805
2. Update public key value inside `build/manifest.json` to maintain
   extension id during development. See: https://developer.chrome.com/apps/app_identity#copy_key

These methods are called during `npm run start` and `npm run build`.
*/

const fs = require("fs");
const localManifestKey =
  "MIIBIjANBgkqhkiG9w0BAQEFAAOCAQ8AMIIBCgKCAQEAlN56sx9mTFsM9qnbym1SLbO2BVyy0ilA75ja9ljoA6CpriYm0uYqY4s6KAQv2v7vZPSelxw+wy3W+HK1yGy+RXcidTtiCb7orVyoiFS2dCwb+g5QsqAyPV+cW3rYv+safbYLPbfHkPnBpSjSvop3BixQz5+//S9p4iqAZqUWfa6Op9NiQ5VaICl/gJeF4rOJGvwLO2D5XoHl24L/q3UZJ+eLUbOyIhY03Qcs25n4rzpq21EfM3lYOZi8xq4Hp89TFQGG63tSrE8xXKiZsHK29K/SJw+cYr74cFUiPwlXA9LA0rZR9Zw0GwvqBSoOoCuDqHGDXBoffdtsLwSgGWSZQwIDAQAB";
const stagingManifestKey =
  "MIIBIjANBgkqhkiG9w0BAQEFAAOCAQ8AMIIBCgKCAQEAhUDe+T5ZFtZ12bmErNpPTSOEHVeP1C6aH8ZNhns4AR+8ytNEXqvw3xorA8RK5lE/1QCKfinfeTzUFsFh/Cu022rOI+d/7cSPI5GtMVtaRuodUjDc6rWPuq1gfHW9/YsZ6IYo+48R9QFJpYToME4AvAj4W0RMDbCFj7FX4wmn2zkeQe4lRbFljPRAUYFJ7hay2aL+pl3YfrQSudD3nfutTYCVn+IpomQS5tuOZ74z1qB5sooD9xuHUYJ72aOQNNJK2c3s4uEi/0XOnH02KyKIVgOj80vKfDW/ZS5+W4IkSm2fMHNHzFrbuGSwi6B1bdZXoAmJ6b6aFluF0b+qhlNKgwIDAQAB";

/**
 * Replace placeholders for js/css with actual values
 * @param {*} buildPath
 */
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

const getManifestJson = buildPath => {
  const manifest = `${buildPath}/manifest.json`;
  const content = fs.readFileSync(manifest, "utf8");
  return JSON.parse(content);
};

/**
 * Write updated manifest json back to the file
 * @param {*} buildPath
 * @param {*} contents
 */
const updateManifestJson = (buildPath, contents) => {
  const manifest = `${buildPath}/manifest.json`;
  fs.writeFileSync(manifest, JSON.stringify(contents));
  console.log("manifest.json updated.");
};

/**
 * Add manifest key to the manifest.json file so that we
 * preserve extension id during development cycles
 * Docs: https://developer.chrome.com/apps/app_identity#copy_key
 * @param {*} buildPath
 */
const updateManifestKey = buildPath => {
  let manifestContents = getManifestJson(buildPath);
  manifestContents.version_name =
    manifestContents.version + " " + getGitBranch();
  const { REACT_APP_BACKEND_ENV } = process.env;

  if (REACT_APP_BACKEND_ENV === "local") {
    manifestContents.name = "Rubberduck [local]";
    manifestContents.key = localManifestKey;
  } else if (REACT_APP_BACKEND_ENV === "staging") {
    manifestContents.name = "Rubberduck [staging]";
    manifestContents.key = stagingManifestKey;
  }

  updateManifestJson(buildPath, manifestContents);
};

/**
 * This method add localhost to the list of permissions
 * @param {*} buildPath
 */
const updatePermissionsForLocalhost = buildPath => {
  let manifestContents = getManifestJson(buildPath);
  const localhost = "http://localhost:8000/*";
  manifestContents.permissions.push(localhost);
  manifestContents.content_scripts[0].matches.push(localhost);
  updateManifestJson(buildPath, manifestContents);
};

/**
 * Changes `//# sourceMappingURL=main.0a203304.js.map` in the js file to `//# sourceMappingURL=chrome-extension://mercury/main.0a203304.js.map`
 * This is required for Sentry source mapping to work properly.
 * @param {*} buildPath
 */
const updateSourceMapUrl = buildPath => {
  const jsPath = `${buildPath}/static/js/`;
  const jsFiles = fs.readdirSync(jsPath);
  const mapFile = jsFiles.filter(name => name.endsWith(".map"))[0];
  const jsFile = jsFiles.filter(name => name.endsWith(".js"))[0];
  const lineToAppend = `\n//# sourceMappingURL=chrome-extension://mercury/${mapFile}`;
  console.log("appending to", jsFile, lineToAppend);
  fs.appendFileSync(`${buildPath}/static/js/${jsFile}`, lineToAppend);
};

module.exports = {
  updateManifestKey: updateManifestKey,
  updateBackground: updateBackground,
  updatePermissionsForLocalhost: updatePermissionsForLocalhost
};

if (require.main === module) {
  // If this script is called as `node ...`, call these methods
  const buildPath = "./build";
  updateBackground(buildPath);
  updateSourceMapUrl(buildPath);

  if (process.env.REACT_APP_CHROME_ZIP !== "true") {
    // We don't update the key in the manifest if the script is
    // run for chrome store zip file
    updateManifestKey(buildPath);
  }
}
