const axios = require("axios");

const parse = require("what-the-diff");

const getGitService = () => window.location.host.split(".")[0];

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
      return this.baseRequest.fetch(uri);
    } else {
      // Make call directly to github using client IP address
      // for efficient rate limit utilisation.
      const caller = this.getAPICaller(uriPath);
      return caller
        .then(response => {
          return response.data ? response.data : response;
        })
        .catch(error => {
          if (error.response.status >= 400 && error.response.status < 500) {
            this.dispatchAuthenticated(false);
          }
        });
    }
  }
};

let GithubAPI = {
  getRemoteUsername(decoded) {
    return decoded.github_username;
  },

  getPassthroughPath() {
    return "github_passthrough/";
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
    return "bitbucket_passthrough/";
  },

  getAPICaller(uriPath) {
    // TODO(arjun): need to verify bitbucket api version
    const uri = `https://api.bitbucket.org/2.0/${uriPath}/`;
    return axios.get(uri, { headers: { Authorization: "" } });
  },

  getFilesTree(username, reponame, branch) {
    const uriPath = `repositories/${username}/${reponame}/src/${branch}`;
    return this.makeConditionalGet(uriPath);
  },

  getPRFiles(username, reponame, pr) {
    const uriPath = `repositories/${username}/${reponame}/pullrequests/${pr}/diff`;
    return this.makeConditionalGet(uriPath).then(response => {
      const parsedDiff = parse.parse(response);
      console.log(parsedDiff);
      const newFiles = parsedDiff
        .filter(element => element.newPath !== null)
        .map(element => element.newPath.replace("b/", ""));
      const oldFiles = parsedDiff
        .filter(element => element.oldPath !== null)
        .map(element => element.oldPath.replace("b/", ""));
      // Merge the two arrays and remove the duplicates
      return newFiles
        .concat(oldFiles)
        .filter((item, index, self) => self.indexOf(item) == index);
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
