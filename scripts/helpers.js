/*
Helper script for two tasks:

1. Update asset (css/js) asset locations inside `build/background.js`.
   For context, see https://github.com/facebook/create-react-app/issues/3805

2. Update public key value inside `build/manifest.json` to maintain
   extension id during development. See: https://developer.chrome.com/apps/app_identity#copy_key

These methods are called during `npm run start` and `npm run build`.
*/

const fs = require("fs");
const devManifestKey =
  "MIIBIjANBgkqhkiG9w0BAQEFAAOCAQ8AMIIBCgKCAQEAkvVJf+G5S0lXA/3kdEQOTE+piotQ3yLBT83uuFr1hDJgLoJXncFwctrH387lO8QKUNi/G1aDP/t5k1CzZKnTm8pxT3bpnZDWN0xDsWFSkIQ4Z4xZsViOpOsswsVQmncMePoyPP712UYLXkjr9KqyT7/+aFaPnGM8e+Awrco+On4XHVX8onQDaOTj/3D/Uz4tbB4tUtmaTuG+wE6gC+ipcyL9VDsEeZbJC/wV4UDdNZxLmiv4i58j6gnhPeOQSccW2p+xXK0wCgCAqMkw5y6DCinbjvQhctQ0vvshLpEepSIkk+LOtIVLiCwvBt8/RBu3ZgVCQcLVLTJShJlPMPo3dQIDAQAB";
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

const getManifestJson = buildPath => {
  const manifest = `${buildPath}/manifest.json`;
  const content = fs.readFileSync(manifest, "utf8");
  return JSON.parse(content);
};

const updateManifestJson = (buildPath, contents) => {
  // Write back new object
  const manifest = `${buildPath}/manifest.json`;
  fs.writeFileSync(manifest, JSON.stringify(contents));
  console.log("manifest.json updated.");
};

const updateManifestKey = buildPath => {
  // Add manifest key to the manifest.json file so that we
  // preserve extension id during development cycles
  // From: https://developer.chrome.com/apps/app_identity#copy_key
  let manifestContents = getManifestJson(buildPath);
  manifestContents.version_name =
    manifestContents.version + " " + getGitBranch();

  if (process.env.REACT_APP_BACKEND_ENV === "local") {
    manifestContents.name = "Rubberduck-local";
    manifestContents.key = localManifestKey;
  } else {
    manifestContents.name = "Rubberduck-development";
    manifestContents.key = devManifestKey;
  }

  updateManifestJson(buildPath, manifestContents);
};

const updateManifestForLocalhost = buildPath => {
  // This method add localhost to the list of permissions
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
  updateManifestForLocalhost: updateManifestForLocalhost
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
