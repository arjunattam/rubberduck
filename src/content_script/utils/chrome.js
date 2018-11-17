// The injected content script and the background page talk via message passing
// This file has utilities for content script to send and receive messages
// Documentation: https://developer.chrome.com/extensions/messaging

export const SEND_MESSAGE_TYPES = [
  "AUTH_TRIGGER",
  "STORAGE_GET_ALL",
  "STORAGE_SYNC_SET",
  "STORAGE_LOCAL_SET",
  "PERMISSIONS_UPDATE",
  "HTTP_POST",
  "HTTP_GET",

  // Messages for native host
  "NATIVE_INFO",
  "NATIVE_INITIALIZE",
  "NATIVE_HOVER",
  "NATIVE_DEFINITION",
  "NATIVE_REFERENCES",
  "NATIVE_FILE_CONTENTS"
];

export const RECEIVE_MESSAGE_TYPES = ["URL_UPDATE"];

const construct = (type, data) => {
  if (SEND_MESSAGE_TYPES.indexOf(type) < 0) {
    throw new Error("Not a valid message type.");
  }

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

export const sendMessagePromise = (type, data) => {
  const message = construct(type, data);

  return new Promise((resolve, reject) => {
    chrome.runtime.sendMessage(message, result => {
      // TODO: can potentially handle errors as rejects
      // Need to define the error payload spec before that
      resolve(result);
    });
  });
};

export const addChromeListener = cb => {
  chrome.runtime.onMessage.addListener((req, sender, sendRes) => {
    cb(req.action, req.data);
  });
};
