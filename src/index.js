import React from "react";
import ReactDOM from "react-dom";
import { Provider } from "react-redux";
import Extension from "./components/Extension";
import store from "./store.js";
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

// Content script setup -- on injection
// registerServiceWorker();
createExtensionContainer();
renderExtension();
