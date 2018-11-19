import React from "react";
import ReactDOM from "react-dom";
import { Provider } from "react-redux";
import Extension from "./components/Extension";
import store from "./store.js";
import * as AnalyticsUtils from "./utils/analytics";
import * as CrashReporting from "./utils/crashes";

const SIDEBAR_CONTAINER_ID = "mercury-sidebar";

const createExtensionContainer = () => {
  const anchor = document.createElement("div");
  anchor.id = SIDEBAR_CONTAINER_ID;
  document.body.insertBefore(anchor, document.body.childNodes[0]);
};

const renderExtension = () => {
  ReactDOM.render(
    <Provider store={store}>
      <Extension />
    </Provider>,
    document.getElementById(SIDEBAR_CONTAINER_ID)
  );
};

const loadCrashReporting = () => {
  CrashReporting.init();
};

const loadAnalytics = () => {
  AnalyticsUtils.init();
};

// Content script setup: called right after injection
loadAnalytics();
loadCrashReporting();
createExtensionContainer();
renderExtension();
