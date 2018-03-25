import GithubPathAdapter from "./github/path";
import BitbucketPathAdapter from "./bitbucket/path";
import * as GithubTreeAdapter from "./github/tree";
import * as BitbucketTreeAdapter from "./bitbucket/tree";

const getGitService = () => window.location.host.split(".")[0];

const GitPathAdapter = () => {
  // Check which adapter to send
  switch (getGitService()) {
    case "github":
      return GithubPathAdapter;
    case "bitbucket":
      return BitbucketPathAdapter;
    default:
      throw new Error("invalid git service");
  }
};

const GitTreeAdapter = () => {
  // Check which adapter to send
  switch (getGitService()) {
    case "github":
      return GithubTreeAdapter;
    case "bitbucket":
      return BitbucketTreeAdapter;
      break;
    default:
      throw new Error("invalid git service");
  }
};

export const pathAdapter = GitPathAdapter();
export const treeAdapter = GitTreeAdapter();
