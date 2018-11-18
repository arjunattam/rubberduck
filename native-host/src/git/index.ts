import child_process from "child_process";
import { RepoPayload } from "../types";
import { URI_PREFIX, toPath, constructRootUri, mkdir } from "../utils";
import { log } from "../logger";

const fs = require("fs");
const git = require("isomorphic-git");
const EventEmitter = require("events");

const emitter = new EventEmitter();
git.plugins.set("fs", fs);
git.plugins.set("emitter", emitter);

emitter.on("message", (message: any) => {
  log(`message: ${message}`);
});

emitter.on("progress", (message: any) => {
  // message is a ProgressEvent, with the following fields
  const { loaded, total, lengthComputable } = message;
});

export const clone = async (repo: RepoPayload) => {
  const dir = toPath(constructRootUri(repo));
  await mkdir(dir);
  await git.clone({
    dir,
    url: `https://github.com/${repo.user}/${repo.name}`,
    singleBranch: true,
    depth: 1
  });
};

export const checkout = async (repo: RepoPayload) => {
  const dir = toPath(constructRootUri(repo));
  await git.checkout({ dir, ref: repo.sha });
};

export const cloneAndCheckout = async (repo: RepoPayload) => {
  await clone(repo);
  await checkout(repo);
  const dir = toPath(constructRootUri(repo));
  return fs.readdirSync(dir);
};

export const info = async () => {
  return new Promise(resolve => {
    const cmd = `du -sh ${toPath(URI_PREFIX)}`;
    child_process.exec(cmd, (error: any, stdout: any, stderr: any) => {
      resolve({
        location: URI_PREFIX,
        size: stdout,
        repos: fs.readdirSync(toPath(URI_PREFIX))
      });
    });
  });
};
