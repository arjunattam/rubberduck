import { injectScript } from "./injector";
import { onStorageChanged } from "./storage";
import { sendMessageToTab } from "./utils";
import { onMessageReceived } from "./messageHandlers";
import NativeHost from "./messageHandlers/native";

chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
  if (changeInfo.status !== "loading") return;

  if (changeInfo.url) {
    // Send message on every URL change to content script
    sendMessageToTab(tabId, "URL_UPDATE", changeInfo.url);
  }

  return injectScript(tabId, changeInfo, tab);
});

chrome.tabs.onRemoved.addListener((tabId, removeInfo) => {
  NativeHost.onTabClosed(tabId);
});

chrome.storage.onChanged.addListener((changes, namespace) => {
  return onStorageChanged(changes, namespace);
});

chrome.runtime.onMessage.addListener((req, sender, sendRes) => {
  return onMessageReceived(req, sender, sendRes);
});

const UNINSTALLATION_FORM_LINK =
  "https://docs.google.com/forms/d/1fK-NaaxlPR2ImacKyTRVilN87NBAWkCgn8lXVbSROEQ";

if (!!chrome.runtime.setUninstallURL) {
  chrome.runtime.setUninstallURL(UNINSTALLATION_FORM_LINK);
}
