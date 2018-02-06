// Methods to use chrome local storage to maintain high level state
const keyPrefix = "mercury.";

export const setLocal = (key, val, cb) => {
  // TODO(arjun): move to the chrome.storage driver
  try {
    localStorage.setItem(keyPrefix + key, JSON.stringify(val));
  } catch (e) {
    const msg =
      "Extension cannot save its settings. " +
      "If the local storage for this domain is full, please clean it up and try again.";
    console.error(msg, e);
  }
  if (cb) cb();
};

export const getLocal = (key, cb) => {
  var val = parse(localStorage.getItem(keyPrefix + key));
  if (cb) cb(val);
  else return val;

  function parse(val) {
    try {
      return JSON.parse(val);
    } catch (e) {
      return val;
    }
  }
};
