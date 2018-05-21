import GithubPathAdapter from "./github/path";
import BitbucketPathAdapter from "./bitbucket/path";
import * as GithubTreeAdapter from "./github/tree";
import * as BitbucketTreeAdapter from "./bitbucket/tree";
import { getListener as githubListener } from "./github/views";
import { getListener as bitbucketListener } from "./bitbucket/views";

export const getGitService = () => {
  const hostname = window.location.host.split(".")[0];

  if (hostname === "localhost") {
    // Temporary fix till we figure out how to mock
    return "github";
  } else {
    return hostname;
  }
};

export const isGithubCompareView = () => {
  const { pathname } = window.location;
  const pathMatch = pathname.match(/^(\/[^\/]+)(\/[^\/]+)\/(.*)/);

  if (pathMatch) {
    const typeClass = pathMatch[3];
    if (typeClass.indexOf("pull") === 0) {
      // Could be pull/18 (is compare view) or pulls (is not)
      return typeClass.indexOf("pulls") !== 0;
    } else {
      return (
        typeClass.indexOf("commit") === 0 || typeClass.indexOf("compare") === 0
      );
    }
  } else {
    return false;
  }
};

export const isCompareView = () => {
  switch (getGitService()) {
    case "bitbucket":
      return true;
    case "github":
      return isGithubCompareView();
    default:
      return false;
  }
};

const pathAdapterMap = {
  github: GithubPathAdapter,
  bitbucket: BitbucketPathAdapter
};

const treeAdapterMap = {
  github: GithubTreeAdapter,
  bitbucket: BitbucketTreeAdapter
};

const pageListenerMap = {
  github: githubListener,
  bitbucket: bitbucketListener
};

export const isMac = () => navigator.platform.indexOf("Mac") >= 0;

export const getMetaKey = () => (isMac() ? "⌘" : "ctrl");

export const pathAdapter = pathAdapterMap[getGitService()];
export const treeAdapter = treeAdapterMap[getGitService()];
export const getPageListener = pageListenerMap[getGitService()];
