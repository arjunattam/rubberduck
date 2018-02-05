// This file injects js and css to the github/bitbucket page
chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
  if (changeInfo.status !== "loading") return;

  chrome.tabs.executeScript(
    tabId,
    {
      file: JS_ASSET_LOCATION,
      runAt: "document_start"
    },
    res => {
      console.log("JS loaded");
    }
  );

  chrome.tabs.insertCSS(
    tabId,
    {
      file: CSS_ASSET_LOCATION,
      runAt: "document_start"
    },
    res => {
      console.log("CSS loaded");
    }
  );
});

// Can also use this for message passing later
chrome.runtime.onMessage.addListener((req, sender, sendRes) => {});
