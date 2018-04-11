import axios from "axios";
import parse from "what-the-diff";
import { getGitService, treeAdapter } from "../../adapters";

let BaseGitRemoteAPI = {
  isRemoteAuthorized() {
    const decoded = this.getDecodedToken();
    if (decoded !== null) {
      const username = this.getRemoteUsername(decoded);
      return username !== "" && username !== undefined;
    } else {
      return false;
    }
  },

  makeConditionalGet(uriPath) {
    if (this.isRemoteAuthorized()) {
      // If user is logged in with github, we will send
      // this API call to pass through via backend.
      const uri = `${this.getPassthroughPath()}${uriPath.replace("?", "%3F")}/`;
      return this.baseRequest.fetch(uri).then(
        response =>
          // This is required for non-json responses, as the passthrough api
          // JSONifies them with the jsonified key
          response.jsonified || response
      );
    } else {
      // Make call directly to github using client IP address
      // for efficient rate limit utilisation.
      const caller = this.getAPICaller(uriPath);
      return caller
        .then(response => (response.data ? response.data : response))
        .catch(error => {
          if (error.response.status > 400 && error.response.status < 404) {
            // Remote has returned auth error
            this.dispatchAuthenticated(false);
          }
        });
    }
  },

  getTree(repoDetails) {
    const { username, reponame, type } = repoDetails;
    const { prId, headSha, baseSha, branch } = repoDetails;

    switch (type) {
      case "pull":
        return this.getPRFiles(username, reponame, prId).then(response =>
          treeAdapter.getPRChildren(reponame, response)
        );
      case "commit":
        return this.getCommitFiles(username, reponame, headSha).then(response =>
          treeAdapter.getPRChildren(reponame, response)
        );
      case "compare":
        return this.getCompareFiles(username, reponame, headSha, baseSha).then(
          response => treeAdapter.getPRChildren(reponame, response)
        );
      default:
        const nonNullBranch = branch || "master"; // TODO(arjun): check for default branch
        return this.getFilesTree(username, reponame, nonNullBranch).then(
          response => treeAdapter.getTreeChildren(reponame, response)
        );
    }
  }
};

let GithubAPI = {
  getRemoteUsername(decoded) {
    return decoded.github_username;
  },

  getPassthroughPath() {
    return `github_passthrough/`;
  },

  getAPICaller(uriPath) {
    const uri = `https://api.github.com/${uriPath}`;
    return axios.get(uri, { headers: { Authorization: "" } });
  },

  getFilesTree(username, reponame, branch) {
    const uriPath = `repos/${username}/${reponame}/git/trees/${branch}?recursive=1`;
    return this.makeConditionalGet(uriPath);
  },

  getPRFiles(username, reponame, pr) {
    const uriPath = `repos/${username}/${reponame}/pulls/${pr}/files`;
    return this.makeConditionalGet(uriPath);
  },

  getCommitFiles(username, reponame, commitSha) {
    const uriPath = `repos/${username}/${reponame}/commits/${commitSha}`;
    return this.makeConditionalGet(uriPath).then(response => response.files);
  },

  getCompareFiles(username, reponame, headSha, baseSha) {
    // TODO(arjun): known issue: this does not work with 2 repositories
    // eg, when branch in the fork is compared to base
    const uriPath = `repos/${username}/${reponame}/compare/${baseSha}...${headSha}`;
    return this.makeConditionalGet(uriPath).then(response => response.files);
  },

  getPRInfo(username, reponame, pr) {
    const uriPath = `repos/${username}/${reponame}/pulls/${pr}`;
    return this.makeConditionalGet(uriPath);
  }
};

let BitbucketAPI = {
  getRemoteUsername(decoded) {
    return decoded.bitbucket_username;
  },

  getPassthroughPath() {
    return `bitbucket_passthrough/`;
  },

  getAPICaller(uriPath) {
    const uri = `https://api.bitbucket.org/2.0/${uriPath}`;
    return axios.get(uri, { headers: { Authorization: "" } });
  },

  getFilesTree(username, reponame, branch) {
    const uriPath = `repositories/${username}/${reponame}/src/${branch}/`;
    return this.makeConditionalGet(uriPath);
  },

  parseLines(element, charToCheck) {
    const hunkValues = element.hunks.map(hunk => {
      const lines = hunk.lines;
      return lines.reduce((total, line) => {
        const num = line[0] === charToCheck ? 1 : 0;
        return total + num;
      }, 0);
    });
    return hunkValues.reduce((total, num) => total + num);
  },

  getDiffData(parsedDiff) {
    // Return file path, additions and deletions by parsing the diff
    // Also uses git diff statuses: `added`, `renamed`, `modified`, `deleted`
    return parsedDiff.map(element => {
      const additions = this.parseLines(element, "+");
      const deletions = this.parseLines(element, "-");
      const filePath = element.newPath || element.oldPath;
      return {
        filename: filePath.replace("b/", ""),
        additions: additions,
        deletions: deletions,
        status: element.status
      };
    });
  },

  getPRFiles(username, reponame, pr) {
    const uriPath = `repositories/${username}/${reponame}/pullrequests/${pr}/diff/`;
    return this.makeConditionalGet(uriPath).then(response => {
      const parsedDiff = parse.parse(response);
      return this.getDiffData(parsedDiff);
    });
  },

  getPRInfo(username, reponame, pr) {}
};

let GitRemoteAPI = {};

switch (getGitService()) {
  case "github":
    GitRemoteAPI = Object.assign(
      {},
      Object.assign({}, BaseGitRemoteAPI, GithubAPI)
    );
    break;
  case "bitbucket":
    GitRemoteAPI = Object.assign(
      {},
      Object.assign({}, BaseGitRemoteAPI, BitbucketAPI)
    );
    break;
  default:
    throw new Error("invalid git service");
}

export { GitRemoteAPI };
