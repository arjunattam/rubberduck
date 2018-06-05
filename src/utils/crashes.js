import Raven from "raven-js";
// import { VERSION } from "../components/status/settings";

const VERSION = "0.2.21";

function normalizeSentryUrl(url) {
  return `chrome-extension://mercury/${url.replace(/^.*[\\\/]/, "")}`;
}

export const init = () => {
  const { REACT_APP_BACKEND_ENV } = process.env;
  const noopEnvironments = ["local", "staging"];
  if (noopEnvironments.indexOf(REACT_APP_BACKEND_ENV) >= 0) {
    return;
  }

  const SENTRY_DSN =
    "https://c59b970dd8d74935ab8a0001e5cdbe14@sentry.io/417166";

  Raven.config(SENTRY_DSN, {
    release: VERSION,
    dataCallback: function(data) {
      // We normalize the urls so that the sourcemap work (also see scripts/sentry.sh)
      if (data.culprit) {
        data.culprit = normalizeSentryUrl(data.culprit);
      }

      if (data.exception) {
        // if data.exception exists,
        // all of the other keys are guaranteed to exist
        data.exception.values[0].stacktrace.frames.forEach(function(frame) {
          frame.filename = normalizeSentryUrl(frame.filename);
        });
      }

      return data;
    }
  }).install();
};

export const setupUser = userInfo => {
  Raven.setUserContext(userInfo);
};

export const catchException = error => {
  Raven.captureException(error);
};
