export const triggerAuthFlow = (data, callback) => {
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
    }
  );
};
