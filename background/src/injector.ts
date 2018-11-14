import { sendMessageToTab } from "./utils";

const INJECTABLE_URLS = ["github.com", "bitbucket.org"];

const DONT_INJECT_PATHS = ["/settings/tokens/new"];

export const injectScript = (
  tabId,
  changeInfo,
  tab,
  jsLocation,
  cssLocation
) => {
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

  if (DONT_INJECT_PATHS.indexOf(extractPath(tab.url)) >= 0) {
    // We don't inject anything in the github "confirm password" screen
    // This might not be an exhaustive set of path names
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
};

// Helper method to extract hostname from url
const extractHostname = url => {
  const parsed = new URL(url);
  return parsed.hostname;
};

const extractPath = url => {
  const parsed = new URL(url);
  return parsed.pathname;
};
