// Methods to use chrome local storage to maintain high level state
import { sendMessage, constructMessage } from "./chrome";

const keyPrefix = "mercury.";

export const setLocal = (key, val, cb) => {
  // TODO(arjun): move to the chrome.storage driver
  try {
    localStorage.setItem(keyPrefix + key, JSON.stringify(val));
  } catch (e) {
    const msg =
      "Extension cannot save its settings. " +
      "If the local storage for this domain is full, please clean it up and try again.";
    console.error(msg, e);
  }
  if (cb) cb();
};

export const getLocal = (key, cb) => {
  var val = parse(localStorage.getItem(keyPrefix + key));
  if (cb) cb(val);
  else return val;

  function parse(val) {
    try {
      return JSON.parse(val);
    } catch (e) {
      return val;
    }
  }
};

export const setInStore = (key, val, cb) => {
  // Send message to background page to set value in chrome.storage
  const message = constructMessage("STORAGE_SET", { key: key, value: val });
  sendMessage(message, cb);
};

export const getFromStore = (key, cb) => {
  // Send message to background page to get value from chrome.storage
  const message = constructMessage("STORAGE_GET", { key: key });
  sendMessage(message, cb);
};

export const setAllInStore = (data, cb) => {
  // Send message to background page to set value in chrome.storage
  const message = constructMessage("STORAGE_SET_ALL", data);
  sendMessage(message, cb);
};

export const getAllFromStore = cb => {
  // Send message to background page to get value from chrome.storage
  const message = constructMessage("STORAGE_GET_ALL", null);
  sendMessage(message, cb);
};
