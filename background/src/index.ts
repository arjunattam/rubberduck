import { injectScript } from "./injector";
import { onStorageChanged } from "./storage";
import { onMessageReceived } from "./messageHandlers";

const jsLocation = "JS_ASSET_LOCATION"; // will be replaced with actual location by script
const cssLocation = "CSS_ASSET_LOCATION"; // will be replaced with actual location by script

chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
  return injectScript(tabId, changeInfo, tab, jsLocation, cssLocation);
});

chrome.storage.onChanged.addListener((changes, namespace) => {
  return onStorageChanged(changes, namespace);
});

chrome.runtime.onMessage.addListener((req, sender, sendRes) => {
  return onMessageReceived(req, sender, sendRes);
});

const UNINSTALLATION_FORM_LINK =
  "https://docs.google.com/forms/d/1fK-NaaxlPR2ImacKyTRVilN87NBAWkCgn8lXVbSROEQ";

if (chrome.runtime.setUninstallURL) {
  chrome.runtime.setUninstallURL(UNINSTALLATION_FORM_LINK);
}
