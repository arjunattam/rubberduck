import amplitude from "amplitude-js";
import Store from "../store";
import { getGitService } from "../adapters";
import { VERSION } from "./version";

const hasAnalytics = () => {
  const { REACT_APP_BACKEND_ENV } = process.env;
  const noopEnvironments = ["local", "staging"];
  if (noopEnvironments.indexOf(REACT_APP_BACKEND_ENV) >= 0) {
    return false;
  }
  return true;
};

export const init = () => {
  if (hasAnalytics()) {
    amplitude.getInstance().init("8034a5a01d1d44f4ac657a7360262339");
  }
};

export const setupUser = userInfo => {
  const { username: userId } = userInfo;
  amplitude.getInstance().setUserId(userId);
  let userIdentity = new amplitude.Identify();
  Object.keys(userInfo).forEach(function(key) {
    userIdentity.set(key, userInfo[key]);
  });
  amplitude.getInstance().identify(userIdentity);
};

const getEventProps = () => {
  const { repoDetails, session, hoverResult } = Store.getState().data;
  const { isSidebarVisible, hasMenuApp } = Store.getState().storage;
  const { status: sessionStatus, progress: sessionProgress } = session;
  return {
    ...repoDetails,
    ...hoverResult,
    sessionStatus,
    sessionProgress,
    isSidebarVisible,
    hasMenuApp,
    version: VERSION,
    service: getGitService()
  };
};

export const logAction = (actionName, eventType) => {
  let name = `extension.${actionName}`;

  if (eventType) {
    name = `${name}.${eventType}`;
  }

  const props = getEventProps();
  amplitude.getInstance().logEvent(name, props);
};

export const logCall = actionName => {
  return logAction(actionName, "call");
};

export const logResponse = actionName => {
  return logAction(actionName, "response");
};

export const logPageView = () => {
  return logAction("injected");
};

export const logSessionEvent = type => {
  return logAction("session", type);
};

export const logSidebarEvent = isOpen => {
  const type = isOpen ? "open" : "close";
  return logAction("sidebar", type);
};

export const logTreeClick = isFile => {
  const type = isFile ? "file.click" : "folder.click";
  return logAction("tree", type);
};

export const logExpandedCodeShow = () => {
  return logAction("expanded_code", "show");
};
