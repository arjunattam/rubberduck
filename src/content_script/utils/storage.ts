import { sendMessage, sendMessagePromise } from "./chrome";

export const setInSyncStore = (data, cb) => {
  // Send message to background page to set value in chrome.storage
  sendMessage("STORAGE_SYNC_SET", data, cb);
};

export const setInLocalStore = (data, cb) => {
  return sendMessagePromise("STORAGE_LOCAL_SET", data);
};

export const getAllFromStore = (): Promise<any> => {
  return sendMessagePromise("STORAGE_GET_ALL", {});
};
