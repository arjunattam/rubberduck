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

export const clean = (message: any) => {
  // Removes uri full path with relative path
  const str = JSON.stringify(message);
  // TODO: remove repo name (hardcoded)
  return JSON.parse(str.replace(`"uri":"${URI_PREFIX}redux/`, '"path":"'));
};

export const constructRootUri = (repo: string) => {
  // TODO: fix path conventions after git setup
  return `${URI_PREFIX}${repo}`;
};

export const constructFileUri = (path: string) => {
  // TODO: fix repo name
  return `${URI_PREFIX}redux/${path}`;
};
