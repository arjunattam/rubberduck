// The injected content script and the background page talk via message passing
// This file has utilities for content script to send and receive messages
// Documentation: https://developer.chrome.com/extensions/messaging

/* Define global to fix linter error */
/* global chrome */

const MESSAGE_TYPES = [
  "AUTH_TRIGGER",
  "STORAGE_SET",
  "STORAGE_GET",
  "HTTP_POST",
  "HTTP_GET"
];

export const constructMessage = (type, data) => {
  // Check if this is a valid type
  if (MESSAGE_TYPES.indexOf(type) < 0) {
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
chrome.runtime.onMessage.addListener((req, sender, sendRes) => {
  const selectionRects = document
    .getSelection()
    .getRangeAt(0)
    .getClientRects();

  console.log("received", req, selectionRects);

  if (selectionRects.length > 0) {
    // We have a selected text rectangle.
    // Now we can trigger the references/definitions section.
    // TODO(arjun): how to call the ref/def components?
    const rect = selectionRects[0];
    const x = rect.left + (rect.right - rect.left) / 2;
    const y = rect.top + (rect.bottom - rect.top) / 2;
    console.log(x, y); // This is to be sent to the component
  }
});
