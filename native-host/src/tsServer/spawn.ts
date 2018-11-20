import * as cp from "child_process";

const BIN_DIR = process.cwd();

// https://github.com/theia-ide/typescript-language-server
const THEIA_LS_SERVER = {
  binary: `${BIN_DIR}/../node_modules/.bin/typescript-language-server`,
  args: ["--stdio", "--log-level", "4", "--tsserver-log-file=ts-logs.txt"]
};

// https://github.com/sourcegraph/javascript-typescript-langserver
const SOURCEGRAPH_LS_SERVER = {
  binary: `${BIN_DIR}/../node_modules/.bin/javascript-typescript-stdio`,
  args: []
};

const LS_SERVER = SOURCEGRAPH_LS_SERVER;

export const spawnServer = (): cp.ChildProcess => {
  const { binary, args } = LS_SERVER;
  return cp.fork(binary, args, { stdio: ["pipe", "pipe", "pipe", "ipc"] });
};
