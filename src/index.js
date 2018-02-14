import React from "react";
import ReactDOM from "react-dom";
import { Provider } from "react-redux";
import Sidebar from "./components/Sidebar";
import store from "./store.js";
// import registerServiceWorker from "./registerServiceWorker";

const createSidebarContainer = () => {
  const anchor = document.createElement("div");
  anchor.id = "mercury-sidebar";
  document.body.insertBefore(anchor, document.body.childNodes[0]);
};

export const renderSidebar = openSection => {
  const containerId = "mercury-sidebar";

  ReactDOM.render(
    <Provider store={store}>
      <Sidebar openSection={openSection} />
    </Provider>,
    document.getElementById(containerId)
  );
};

// Content script setup -- on injection
// registerServiceWorker();
createSidebarContainer();
renderSidebar("tree");
