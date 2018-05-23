import React from "react";
import ReactDOM from "react-dom";
import { Provider } from "react-redux";
import Extension from "./components/Extension";
import store from "./store.js";
import Raven from "raven-js";
import { VERSION } from "./components/status/settings";
// import registerServiceWorker from "./registerServiceWorker";

const containerId = "mercury-sidebar";

const createExtensionContainer = () => {
  const anchor = document.createElement("div");
  anchor.id = containerId;
  document.body.insertBefore(anchor, document.body.childNodes[0]);
};

const renderExtension = () => {
  ReactDOM.render(
    <Provider store={store}>
      <Extension />
    </Provider>,
    document.getElementById(containerId)
  );
};

function normalizeSentryUrl(url) {
  return `chrome-extension://mercury/${url.replace(/^.*[\\\/]/, "")}`;
}

const loadSentry = () => {
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

const loadDoorbell = () => {};

// Content script setup -- on injection
// registerServiceWorker();
loadSentry();
loadDoorbell();
createExtensionContainer();
renderExtension();
