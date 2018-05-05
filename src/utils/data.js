import { Base64 } from "js-base64";

export const encodeToBase64 = string => Base64.encode(string);

export const decodeBase64 = string => Base64.decode(string);

export const hash = string =>
  string
    .split("")
    .reduce(
      (prevHash, currVal) =>
        ((prevHash << 5) - prevHash + currVal.charCodeAt(0)) | 0,
      0
    );
