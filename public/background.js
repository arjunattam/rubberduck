// This file injects js and css to the github/bitbucket page
chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
  if (changeInfo.status !== "loading") return;

  chrome.tabs.executeScript(
    tabId,
    {
      code:
        "var injected = window.mercuryInjected; window.mercuryInjected = true; injected;",
      runAt: "document_start"
    },
    res => {
      if (chrome.runtime.lastError || res[0])
        // Don't continue if error (i.e. page isn't in permission list)
        // Or if the value of `injected` above: we don't want to inject twice
        return;

      chrome.tabs.executeScript(tabId, {
        file: JS_ASSET_LOCATION, // will be replaced with actual location by script
        runAt: "document_start"
      });

      chrome.tabs.insertCSS(tabId, {
        file: CSS_ASSET_LOCATION, // will be replaced with actual location by script
        runAt: "document_start"
      });
    }
  );
});

// Listener for messages from the content script
chrome.runtime.onMessage.addListener((req, sender, sendRes) => {
  console.log("Message received", req);
  // Define message types and handlers
  const handlers = {
    TRIGGER_AUTH: triggerAuthFlow
  };
  handlers[req.message](req.data, sendRes);
  // Return true to inform that we will send response async
  return true;
});

// Handler for the launch auth flow message
const triggerAuthFlow = (data, callback) => {
  chrome.identity.launchWebAuthFlow(
    {
      url: data.url,
      interactive: true
    },
    function(redirectUrl) {
      // Send redirect url back to the content script
      // We could potentially just consume it here, but for now
      // the background is kept to be lightweight.
      callback(redirectUrl);
    }
  );
};
