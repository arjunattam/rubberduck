import GithubPathAdapter from "./github/path";
import BitbucketPathAdapter from "./bitbucket/path";
import * as GithubTreeAdapter from "./github/tree";
import * as BitbucketTreeAdapter from "./bitbucket/tree";
import { getListener as githubListener } from "./github/views";
import { getListener as bitbucketListener } from "./bitbucket/views";

export const getGitService = () => window.location.host.split(".")[0];

export const isGithubCompareView = () => {
  const { pathname } = window.location;
  const pathMatch = pathname.match(/^(\/[^\/]+)(\/[^\/]+)\/(.*)/);

  if (pathMatch) {
    const typeClass = pathMatch[3];
    return (
      typeClass.indexOf("pull") === 0 ||
      typeClass.indexOf("commit") === 0 ||
      typeClass.indexOf("compare") === 0
    );
  } else {
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
