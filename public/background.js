const jsLocation = JS_ASSET_LOCATION; // will be replaced with actual location by script
const cssLocation = CSS_ASSET_LOCATION; // will be replaced with actual location by script

const INJECTABLE_URLS = ["github.com", "bitbucket.org"];

const UNINSTALLATION_FORM_LINK =
  "https://docs.google.com/forms/d/1fK-NaaxlPR2ImacKyTRVilN87NBAWkCgn8lXVbSROEQ";

// This file injects js and css to the github/bitbucket page
chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
  if (changeInfo.status !== "loading") return;
  // Send message on every URL change to content script
  if (changeInfo.url) {
    sendMessageToTab(tabId, "URL_UPDATE", changeInfo.url);
  }
  // To ensure we don't inject the extension twice
  const injectFlagCode =
    "var injected = window.mercuryInjected; window.mercuryInjected = true; injected;";

  if (!tab.url || INJECTABLE_URLS.indexOf(extractHostname(tab.url)) < 0) {
    // Tab hostname is not in the INJECTABLE_URLS
    return;
  }

  chrome.tabs.executeScript(
    tabId,
    { code: injectFlagCode, runAt: "document_end" },
    res => {
      if (chrome.runtime.lastError || res[0])
        // Don't continue if error (i.e. page isn't in permission list)
        // Or if the value of `injected` above: we don't want to inject twice
        return;

      if (jsLocation !== null) {
        chrome.tabs.executeScript(tabId, {
          file: jsLocation,
          runAt: "document_end"
        });
      }

      if (cssLocation !== null) {
        chrome.tabs.insertCSS(tabId, {
          file: cssLocation,
          runAt: "document_end"
        });
      }
    }
  );
});

chrome.storage.onChanged.addListener(function(changes, namespace) {
  let storageChanges = {};
  for (key in changes) {
    let storageChange = changes[key];
    storageChanges = {
      ...storageChanges,
      [key]: storageChange.newValue
    };
  }
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
    HTTP_POST: postAjax
  };
  handlers[req.message](req.data, sendRes);
  // Return true to inform that we will send response async
  return true;
});

if (chrome.runtime.setUninstallURL) {
  chrome.runtime.setUninstallURL(UNINSTALLATION_FORM_LINK);
}

// Helper method to send message to specific tab(by id) in content script.
const sendMessageToTab = (tabId, action, data) => {
  chrome.tabs.sendMessage(
    tabId,
    {
      action: action,
      data: data
    },
    res => {}
  );
};

// Helper method to send message to the current tab in content script.
const sendMessageToCurrentTab = (action, data) => {
  chrome.tabs.query({ active: true, currentWindow: true }, function(tabs) {
    sendMessageToTab(tabs[0].id, action, data);
  });
};

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

  var xhr = window.XMLHttpRequest
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
  var xhr = window.XMLHttpRequest
    ? new XMLHttpRequest()
    : new ActiveXObject("Microsoft.XMLHTTP");
  xhr.open("GET", url);
  xhr.onreadystatechange = function() {
    if (xhr.readyState > 3 && xhr.status == 200) success(xhr.responseText);
  };
  xhr.send();
  return xhr;
}

// Helper method to extract hostname from url
const extractHostname = url => {
  var hostname;
  //find & remove protocol (http, ftp, etc.) and get hostname

  if (url.indexOf("://") > -1) {
    hostname = url.split("/")[2];
  } else {
    hostname = url.split("/")[0];
  }

  //find & remove port number
  hostname = hostname.split(":")[0];
  //find & remove "?"
  hostname = hostname.split("?")[0];

  return hostname;
};
