import { API } from "../utils/api";

export function setFromChromeStorage(data) {
  return {
    type: "SET_FROM_CHROME_STORAGE",
    payload: data
  };
}

export function updateFromChromeStorage(data) {
  return {
    type: "UPDATE_FROM_CHROME_STORAGE",
    payload: data
  };
}
