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

export const isSplitDiffGithubView = () => {
  return (
    getGitService() === "github" &&
    document.querySelector("table.file-diff-split")
  );
};

export const getFileboxSelector = path => {
  const service = getGitService();

  if (service === "github") {
    return `div.file-header[data-path="${path}"]`;
  } else if (service === "bitbucket") {
    return `section.iterable-item[data-path="${path}"]`;
  }
};

export const appendLineNumber = (baseLink, lineNumber) => {
  switch (getGitService()) {
    case "github":
      return `${baseLink}#L${lineNumber + 1}`;
    case "bitbucket":
      return `${baseLink}#lines-${lineNumber + 1}`;
    default:
      return baseLink;
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

// export const pathAdapterDeprecated = pathAdapterMap[getGitService()];
export const treeAdapter = treeAdapterMap[getGitService()];
export const getPageListener = pageListenerMap[getGitService()];
