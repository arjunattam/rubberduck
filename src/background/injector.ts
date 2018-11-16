const INJECTABLE_URLS = ["github.com", "bitbucket.org"];

const DONT_INJECT_PATHS = ["/settings/tokens/new"];

export const injectScript = (
  tabId,
  changeInfo,
  tab
  // jsLocation,
  // cssLocation
) => {
  // To ensure we don't inject the extension twice
  const injectFlagCode =
    "var injected = window.mercuryInjected; window.mercuryInjected = true; injected;";

  if (!tab.url || INJECTABLE_URLS.indexOf(extractHostname(tab.url)) < 0) {
    return; // Tab hostname is not in the INJECTABLE_URLS
  }

  if (DONT_INJECT_PATHS.indexOf(extractPath(tab.url)) >= 0) {
    // We don't inject anything in the github "confirm password" screen
    return;
  }

  chrome.tabs.executeScript(
    tabId,
    { code: injectFlagCode, runAt: "document_end" },
    res => {
      if (chrome.runtime.lastError || res[0]) {
        // Don't continue if error (i.e. page isn't in permission list)
        // Or if the value of `injected` above: we don't want to inject twice
        return;
      }

      chrome.tabs.executeScript(tabId, {
        file: "js/content_script.js",
        runAt: "document_end"
      });

      chrome.tabs.executeScript(tabId, {
        file: "js/vendor.js",
        runAt: "document_end"
      });
    }
  );
};

const extractHostname = url => {
  const parsed = new URL(url);
  return parsed.hostname;
};

const extractPath = url => {
  const parsed = new URL(url);
  return parsed.pathname;
};
