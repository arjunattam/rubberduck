import GithubPathAdapter from "./github/path";
import BitbucketPathAdapter from "./bitbucket/path";

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

export const pathAdapter = GitPathAdapter();
