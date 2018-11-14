export const saveToSyncStorage = (data, callback) => {
  // data must have key and value, callback will not have any args
  // Save it using the Chrome extension storage sync API
  // Docs: https://developer.chrome.com/apps/storage
  chrome.storage.sync.set(data, function() {
    callback();
  });
};

export const saveToLocalStorage = (data, callback) => {
  chrome.storage.local.set(data, function() {
    callback();
  });
};

export const getAllFromStorage = (data, callback) => {
  // data must have key, callback will be called with value
  chrome.storage.sync.get(null, function(syncData) {
    chrome.storage.local.get(null, function(localData) {
      callback({ ...syncData, ...localData });
    });
  });
};
