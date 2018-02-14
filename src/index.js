import React from "react";
import ReactDOM from "react-dom";
import Sidebar from "./components/Sidebar";
// import registerServiceWorker from "./registerServiceWorker";

const createSidebarContainer = () => {
  const anchor = document.createElement("div");
  anchor.id = "mercury-sidebar";
  document.body.insertBefore(anchor, document.body.childNodes[0]);
};

export const renderSidebar = openSection => {
  const containerId = "mercury-sidebar";

  ReactDOM.render(
    <Sidebar openSection={openSection} />,
    document.getElementById(containerId)
  );
};

// Content script setup -- on injection
// registerServiceWorker();
createSidebarContainer();
renderSidebar("tree");
