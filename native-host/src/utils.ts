import fs from "fs";
import { RepoPayload } from "./types";
const mkdirp = require("mkdirp");

export const URI_PREFIX = "file:///Users/arjun/local_repos";

export const toPath = (uriPath: string) => {
  return uriPath.replace("file://", "");
};

export const readFile = (fileUri: string): Promise<string> => {
  return new Promise((resolve, reject) => {
    fs.readFile(toPath(fileUri), "utf8", (err: any, contents: any) => {
      resolve(contents);
    });
  });
};

export const clean = (message: any, repoInfo: RepoPayload) => {
  // Removes uri full path with relative path
  const str = JSON.stringify(message);
  const rootUri = constructRootUri(repoInfo);
  return JSON.parse(str.replace(`"uri":"${rootUri}/`, '"path":"'));
};

export const constructRootUri = (repoInfo: RepoPayload) => {
  const { name, sha } = repoInfo;
  return `${URI_PREFIX}/${name}_${sha}`;
};

export const constructFileUri = (repoInfo: RepoPayload, path: string) => {
  const rootUri = constructRootUri(repoInfo);
  return `${rootUri}/${path}`;
};

export const mkdir = (path: string): Promise<void> => {
  return new Promise((resolve, reject) => {
    mkdirp(path, (err: any) => {
      if (err) reject(err);
      else resolve();
    });
  });
};
