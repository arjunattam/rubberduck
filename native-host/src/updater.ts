// const AutoUpdate = require("cli-autoupdate");

// // load package.json of the package you wish to update
// let pkg = require("../../package.json");

// const update = new AutoUpdate(pkg);

// update.on("update", () => console.log("started update"));
// update.on("finish", () => console.log("finished updating"));

import * as cp from "child_process";
import { log } from "./logger";

const PACKAGE_NAME = "rubberduck-native";

export const installUpdate = () => {
  log(`starting update -->`);
  const options = { shell: `/bin/zsh` };
  // const cmd = `/Users/arjun/.nvm/versions/node/v9.11.1/bin/npm install -g ${PACKAGE_NAME}`;
  const cmd = `echo $PATH`;
  return new Promise((resolve, reject) => {
    cp.exec(cmd, options, (error, stdout, stderr) => {
      resolve({ stdout, error, stderr });
    });
  });
};
