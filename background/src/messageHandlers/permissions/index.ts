/**
 * This method updates chrome.permissions to make sure we can
 * communicate to all the urls (like localhost).
 * Docs: https://developer.chrome.com/extensions/permissions#method-contains
 */
export const updatePermissions = (data, callback) => {
  const { url } = data; // the url to check
  const permissionsObj = { origins: [url] };
  chrome.permissions.contains(permissionsObj, result => {
    if (result) {
      // url is already configured for permissions
      callback(result);
    } else {
      // request for permissions here
      chrome.permissions.request(permissionsObj, result => {
        callback(result);
      });
    }
  });
};
