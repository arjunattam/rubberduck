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
  const { repoDetails } = Store.getState().data;
  const { isSidebarVisible, hasMenuApp } = Store.getState().storage;
  return {
    ...repoDetails,
    isSidebarVisible,
    hasMenuApp,
    version: VERSION,
    service: getGitService()
  };
};

export const logSessionEvent = type => {
  const name = `extension.session.${type}`;
  const props = getEventProps();
  amplitude.getInstance().logEvent(name, props);
};

export const logSidebarEvent = isOpen => {
  const type = isOpen ? "open" : "close";
  const name = `extension.sidebar.${type}`;
  const props = getEventProps();
  amplitude.getInstance().logEvent(name, props);
};

export const logTreeClick = () => {
  const name = `extension.tree.click`;
  const props = getEventProps();
  amplitude.getInstance().logEvent(name, props);
};
