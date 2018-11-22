import fs from "fs";
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
  const toReplace = `"uri":"${rootUri}/`;
  return JSON.parse(str.replace(new RegExp(toReplace, "g"), '"path":"'));
};

export const constructCloneUri = (repoInfo: RepoPayload) => {
  return `${URI_PREFIX}/${repoInfo.name}.git`;
};

export const constructRootUri = (repoInfo: RepoPayload) => {
  const { name, sha } = repoInfo;
  return `${URI_PREFIX}/${name}_${sha.substring(0, 7)}`;
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
