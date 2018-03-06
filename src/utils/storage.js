// Methods to use chrome local storage to maintain high level state
import { sendMessage, constructMessage } from "./chrome";

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
