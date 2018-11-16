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

export const sendMessageToAllTabs = (action, data) => {
  chrome.tabs.query({}, function(tabs) {
    for (let i = 0; i < tabs.length; ++i) {
      sendMessageToTab(tabs[i].id, action, data);
    }
  });
};
