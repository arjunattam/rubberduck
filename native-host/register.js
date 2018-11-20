#!/usr/bin/env node

const fs = require("fs");
const cp = require("child_process");
const mkdirp = require("mkdirp");

const PACKAGE_NAME = "rubberduck-native";
const MANIFEST = "io.rubberduck.native.json";

const HOME_DIR = process.env.HOME;
const CHROME_PATH = `${HOME_DIR}/Library/Application Support/Google/Chrome/NativeMessagingHosts`;

const command = cp.spawnSync("npm", ["-g", "root"]);
const NPM_ROOT = command.stdout.toString().trim();

const BINARY = `${NPM_ROOT}\/${PACKAGE_NAME}\/bin\/rubberduck-native`;

mkdirp(CHROME_PATH, (err, done) => {
  const finalPath = `${CHROME_PATH}/${MANIFEST}`;

  const manifest = JSON.parse(fs.readFileSync(MANIFEST, "utf8"));
  manifest.path = BINARY;
  fs.writeFileSync(finalPath, JSON.stringify(manifest, null, 4));
});
