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

const commonSubArray = (x, y) => {
  const xarray = x.split("/");
  const yarray = y.split("/");
  const minLength = Math.min(xarray.length, yarray.length);

  for (let i = 0; i < minLength; i++) {
    if (xarray[i] !== yarray[i]) {
      return i;
    }
  }

  return minLength;
};

export const pathNearnessSorter = (x, y, input) =>
  commonSubArray(y, input) - commonSubArray(x, input);
