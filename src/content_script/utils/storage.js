import { sendMessage } from "./chrome";

export const setInSyncStore = (data, cb) => {
  // Send message to background page to set value in chrome.storage
  sendMessage("STORAGE_SYNC_SET", data, cb);
};

export const setInLocalStore = (data, cb) => {
  sendMessage("STORAGE_LOCAL_SET", data, cb);
};

export const getAllFromStore = cb => {
  // Send message to background page to get value from chrome.storage
  sendMessage("STORAGE_GET_ALL", {}, cb);
};
