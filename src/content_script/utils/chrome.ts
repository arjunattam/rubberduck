// The injected content script and the background page talk via message passing
// This file has utilities for content script to send and receive messages
// Documentation: https://developer.chrome.com/extensions/messaging
const construct = (type, data) => {
  return {
    message: type,
    data
  };
};

export const sendMessage = (type, data, callback) => {
  const message = construct(type, data);
  chrome.runtime.sendMessage(message, function(response) {
    if (callback) {
      callback(response);
    }
  });
};

export const sendMessagePromise = (type, data): Promise<any> => {
  const message = construct(type, data);

  return new Promise((resolve, reject) => {
    chrome.runtime.sendMessage(message, result => {
      if (!!result && !!result.error) {
        reject(result);
      } else {
        // eg, STORAGE_LOCAL_SET can return `null` result
        resolve(result);
      }
    });
  });
};

export const addChromeListener = cb => {
  chrome.runtime.onMessage.addListener((req, sender, sendRes) => {
    cb(req.action, req.data);
  });
};
