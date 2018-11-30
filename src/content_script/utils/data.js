import { Base64 } from "js-base64";

export const encodeToBase64 = string => {
  if (!!string) {
    return Base64.encode(string);
  }
};

export const decodeBase64 = string => Base64.decode(string);

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
