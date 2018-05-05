import { sendMessage, constructMessage } from "./chrome";

export const setInSyncStore = (data, cb) => {
  // Send message to background page to set value in chrome.storage
  const message = constructMessage("STORAGE_SYNC_SET", data);
  sendMessage(message, cb);
};

export const setInLocalStore = (data, cb) => {
  const message = constructMessage("STORAGE_LOCAL_SET", data);
  sendMessage(message, cb);
};

export const getAllFromStore = cb => {
  // Send message to background page to get value from chrome.storage
  const message = constructMessage("STORAGE_GET_ALL", null);
  sendMessage(message, cb);
};
