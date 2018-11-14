import { injector } from "./injector";
import { sendMessageToTab } from "./utils";

const jsLocation = "JS_ASSET_LOCATION"; // will be replaced with actual location by script
const cssLocation = "CSS_ASSET_LOCATION"; // will be replaced with actual location by script

const INJECTABLE_URLS = ["github.com", "bitbucket.org"];

const UNINSTALLATION_FORM_LINK =
  "https://docs.google.com/forms/d/1fK-NaaxlPR2ImacKyTRVilN87NBAWkCgn8lXVbSROEQ";

// This file injects js and css to the github/bitbucket page
chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
  return injector(tabId, changeInfo, tab, jsLocation, cssLocation);
});

chrome.storage.onChanged.addListener(function(changes, namespace) {
  let storageChanges = {};
  const keys = Object.keys(changes);

  keys.forEach(key => {
    let storageChange = changes[key];
    storageChanges = {
      ...storageChanges,
      [key]: storageChange.newValue
    };
  });

  sendMessageToAllTabs("STORAGE_UPDATED", storageChanges);
});

// Listener for messages from the content script
chrome.runtime.onMessage.addListener((req, sender, sendRes) => {
  console.log("Message received", req);
  // Define message types and handlers
  // TODO(arjun): handle runtime.lastError for each of these handlers
  // https://developer.chrome.com/apps/runtime#property-lastError
  const handlers = {
    AUTH_TRIGGER: triggerAuthFlow,
    STORAGE_SYNC_SET: saveToSyncStorage,
    STORAGE_LOCAL_SET: saveToLocalStorage,
    STORAGE_GET_ALL: getAllFromStorage,
    HTTP_GET: getAjax,
    HTTP_POST: postAjax,
    PERMISSIONS_UPDATE: updatePermissions
  };
  handlers[req.message](req.data, sendRes);
  // Return true to inform that we will send response async
  return true;
});

if (chrome.runtime.setUninstallURL) {
  chrome.runtime.setUninstallURL(UNINSTALLATION_FORM_LINK);
}

const sendMessageToAllTabs = (action, data) => {
  chrome.tabs.query({}, function(tabs) {
    for (let i = 0; i < tabs.length; ++i) {
      sendMessageToTab(tabs[i].id, action, data);
    }
  });
};

// Handler for the launch auth flow message
const triggerAuthFlow = (data, callback) => {
  // data must have url
  const { url } = data;
  chrome.identity.launchWebAuthFlow(
    {
      url: url,
      interactive: true
    },
    function(redirectUrl) {
      // Send redirect url back to the content script
      // We could potentially just consume it here, but for now
      // the background is kept to be lightweight.
      callback(redirectUrl);
      // TODO(arjun): if there is an error, refresh the JWT
    }
  );
};

// Handler for saving multiple keys to storage
const saveToSyncStorage = (data, callback) => {
  // data must have key and value, callback will not have any args
  // Save it using the Chrome extension storage sync API
  // Docs: https://developer.chrome.com/apps/storage
  chrome.storage.sync.set(data, function() {
    callback();
  });
};

const saveToLocalStorage = (data, callback) => {
  chrome.storage.local.set(data, function() {
    callback();
  });
};

// Handler for getting from storage
const getAllFromStorage = (data, callback) => {
  // data must have key, callback will be called with value
  chrome.storage.sync.get(null, function(syncData) {
    chrome.storage.local.get(null, function(localData) {
      callback({ ...syncData, ...localData });
    });
  });
};

/**
 * This method updates chrome.permissions to make sure we can
 * communicate to all the urls (like localhost).
 * Docs: https://developer.chrome.com/extensions/permissions#method-contains
 */
const updatePermissions = (data, callback) => {
  const { url } = data; // the url to check
  const permissionsObj = { origins: [url] };
  chrome.permissions.contains(permissionsObj, result => {
    if (result) {
      // url is already configured for permissions
      callback(result);
    } else {
      // request for permissions here
      chrome.permissions.request(permissionsObj, result => {
        callback(result);
      });
    }
  });
};

// Plain js network calls
function postAjax(fulldata, success) {
  const { url, data } = fulldata;
  var params =
    typeof data == "string"
      ? data
      : Object.keys(data)
          .map(function(k) {
            return encodeURIComponent(k) + "=" + encodeURIComponent(data[k]);
          })
          .join("&");

  var xhr = (<any>window).XMLHttpRequest
    ? new XMLHttpRequest()
    : new ActiveXObject("Microsoft.XMLHTTP");
  xhr.open("POST", url);
  xhr.onreadystatechange = function() {
    if (xhr.readyState > 3 && xhr.status == 200) {
      success(JSON.parse(xhr.responseText));
    }
  };
  xhr.setRequestHeader("Content-Type", "application/x-www-form-urlencoded");
  xhr.send(params);
  return xhr;
}

function getAjax(data, success) {
  const { url } = data;
  var xhr = (<any>window).XMLHttpRequest
    ? new XMLHttpRequest()
    : new ActiveXObject("Microsoft.XMLHTTP");
  xhr.open("GET", url);
  xhr.onreadystatechange = function() {
    if (xhr.readyState > 3 && xhr.status == 200) success(xhr.responseText);
  };
  xhr.send();
  return xhr;
}
