import { Base64 } from "js-base64";

export const encodeToBase64 = string => {
  return Base64.encode(string);
};

export const decodeBase64 = string => {
  return Base64.decode(string);
};
