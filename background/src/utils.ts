// Helper method to send message to specific tab(by id) in content script.
export const sendMessageToTab = (tabId, action, data) => {
  chrome.tabs.sendMessage(
    tabId,
    {
      action: action,
      data: data
    },
    res => {}
  );
};
