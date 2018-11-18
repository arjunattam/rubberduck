import { RepoPayload } from "./types";
const fs = require("fs");

const URI_PREFIX = "file:///Users/arjun/";

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
  // TODO: fix path conventions after git setup
  return `${URI_PREFIX}${repoInfo.name}`;
};

export const constructFileUri = (repoInfo: RepoPayload, path: string) => {
  const rootUri = constructRootUri(repoInfo);
  return `${rootUri}/${path}`;
};
