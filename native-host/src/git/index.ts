import child_process from "child_process";
import {
  BASE_REPOS_URI,
  toPath,
  constructRootUri,
  constructCloneUri,
  mkdir
} from "../utils";
import { emitter } from "./emitter";
import { log } from "../logger";

const fs = require("fs");
const git = require("isomorphic-git");

git.plugins.set("fs", fs);
git.plugins.set("emitter", emitter);

const getTempSuffix = (path: string) => {
  const temp = Math.random()
    .toString(36)
    .substring(7);
  return `${path}_temp_${temp}`;
};

export class GitManager {
  clonePath: string;
  finalPath: string;

  constructor(private repo: RepoPayload, private cloneUrl: string) {
    this.clonePath = toPath(constructCloneUri(repo));
    this.finalPath = toPath(constructRootUri(repo));
  }

  async clone() {
    await mkdir(this.clonePath);
    await git.clone({
      gitdir: this.clonePath,
      url: this.cloneUrl,
      noCheckout: true
    });
  }

  async checkout() {
    log(`Attempting to checkout at ${this.finalPath}`);
    await mkdir(this.finalPath);
    await git.checkout({
      gitdir: this.clonePath,
      dir: this.finalPath,
      ref: this.repo.sha
    });
  }

  async cloneAndCheckout() {
    const isAvailable = await this.isAlreadyCheckedOut();

    if (!isAvailable) {
      await this.clone();
      await this.checkout();
    }

    return fs.readdirSync(this.finalPath);
  }

  async isAlreadyCheckedOut() {
    return new Promise((resolve, reject) => {
      fs.readdir(this.finalPath, (err: any, files: any) => {
        resolve(files && files.length > 0);
      });
    });
  }
}

export const info = async () => {
  return new Promise(resolve => {
    const cmd = `du -sh ${toPath(BASE_REPOS_URI)}`;
    child_process.exec(cmd, (error: any, stdout: any, stderr: any) => {
      resolve({
        location: BASE_REPOS_URI,
        size: stdout,
        repos: fs.readdirSync(toPath(BASE_REPOS_URI))
      });
    });
  });
};
