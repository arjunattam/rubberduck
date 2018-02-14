// The injected content script and the background page talk via message passing
// This file has utilities for content script to send and receive messages
// Documentation: https://developer.chrome.com/extensions/messaging

/* Define global to fix linter error */
/* global chrome */

const SEND_MESSAGE_TYPES = [
  "AUTH_TRIGGER",
  "STORAGE_SET",
  "STORAGE_GET",
  "HTTP_POST",
  "HTTP_GET"
];

export const constructMessage = (type, data) => {
  // Check if this is a valid type
  if (SEND_MESSAGE_TYPES.indexOf(type) < 0) {
    throw new Error("Not a valid message type.");
  }

  return {
    message: type,
    data: data
  };
};

export const sendMessage = (message, callback) => {
  chrome.runtime.sendMessage(message, function(response) {
    callback(response);
  });
};

// Handler for messages from background.js
export const addChromeListener = cb => {
  chrome.runtime.onMessage.addListener((req, sender, sendRes) => {
    cb(req.action);
  });
};
