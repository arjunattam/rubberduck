#!/usr/bin/env node
const fs = require("fs");
const cp = require("child_process");
const mkdirp = require("mkdirp");
const meow = require("meow");

const PACKAGE_NAME = "rubberduck-native";
const MANIFEST = "io.rubberduck.native.json";
const HOME_DIR = process.env.HOME;
const CHROME_PATH = `${HOME_DIR}/Library/Application Support/Google/Chrome/NativeMessagingHosts`;

// -b flag can specify the location of binary. If not available, assume binary inside npm root
const argFlags = meow({}).flags;
const argsBinaryLocation = argFlags["b"];
let BINARY = argsBinaryLocation;

if (!argsBinaryLocation) {
  const command = cp.spawnSync("npm", ["-g", "root"]);
  const NPM_ROOT = command.stdout.toString().trim();
  BINARY = `${NPM_ROOT}\/${PACKAGE_NAME}\/bin\/rubberduck-native-mac`;
}

mkdirp(CHROME_PATH, (err, done) => {
  const finalPath = `${CHROME_PATH}/${MANIFEST}`;
  const manifest = JSON.parse(fs.readFileSync(MANIFEST, "utf8"));
  manifest.path = BINARY;
  fs.writeFileSync(finalPath, JSON.stringify(manifest, null, 4));
});
