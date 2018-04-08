import React from "react";
import ReactDOM from "react-dom";
import { Provider } from "react-redux";
import Extension from "./components/Extension";
import store from "./store.js";
import Raven from "raven-js";
import { getGitService } from "./adapters";
// import registerServiceWorker from "./registerServiceWorker";

const Pjax = require("pjax");
let GlobalPjax;

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

const loadSentry = () => {
  if (process.env.REACT_APP_BACKEND_ENV === "local") {
    return;
  }

  Raven.config(
    "https://c59b970dd8d74935ab8a0001e5cdbe14@sentry.io/417166"
  ).install();
};

const getPjaxSelector = () => {
  const service = getGitService();
  if (service === "github") {
    return ["#js-repo-pjax-container"];
  } else if (service === "bitbucket") {
    return ["#source-container"];
  }
};

const createPjax = () => {
  // The `elements` needs to be namespaced or it shows weird
  // behaviour on Github. The PR buttons gets disabled on going from
  // repo home page --> open new PR page.
  GlobalPjax = new Pjax({
    elements: "#mercury-sidebar a", // default is "a[href], form[action]"
    selectors: getPjaxSelector(),
    disablePjaxHeader: true,
    cacheBust: false,
    currentUrlFullReload: false
  });
};

const setupPjax = () => {
  // Trigger pjax setup whenever the files tree DOM changes
  // Select the node that will be observed for mutations
  var targetNode = document.querySelector(".tree-container");
  // Options for the observer (which mutations to observe)
  var config = { childList: true, subtree: true };
  // Callback function to execute when mutations are observed
  var callback = function(mutationsList) {
    createPjax();
  };
  // Create an observer instance linked to the callback function
  var observer = new MutationObserver(callback);
  // Start observing the target node for configured mutations
  if (targetNode) {
    observer.observe(targetNode, config);
    createPjax();
  }
};

// Content script setup -- on injection
// registerServiceWorker();
createExtensionContainer();
renderExtension();
loadSentry();

// Wait for 2 seconds, and then setup pjax
setTimeout(() => {
  setupPjax();
}, 2000);
