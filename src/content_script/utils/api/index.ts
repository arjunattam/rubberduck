import parse from "diffparser";
import { AuthUtils } from "../authorization";
import { getGitService } from "../../adapters";
import { API as BaseAPI } from "./base";
import * as Octokit from "@octokit/rest";

abstract class BaseGitRemoteAPI {
  getDecodedToken() {
    return AuthUtils.getDecodedToken();
  }

  isRemoteAuthorized(isPrivate) {
    const decoded = this.getDecodedToken();

    if (decoded !== null) {
      // Oauth case: github + bitbucket. If username exists,
      // then remote is definitely authorized.
      const username = this.getRemoteUsername(decoded);

      if (username !== "" && username !== undefined) {
        return true;
      }
    }

    // Now this could be the github app scenario, where
    // the decoded JWT does not have the Oauth username, but
    // remote is still authorized via an app installation.
    if (getGitService() === "github" && isPrivate) {
      // Here, if the repo is public, we can return false. But if the
      // repo is private, we should try reaching the server, just in case
      // authentication is available.
      return true;
    }

    return false;
  }

  async makePassthrough(uriPath) {
    const fixedPath = uriPath.replace("?", "%3F");
    const fullUri = `${this.getPassthroughPath()}${fixedPath}/`;

    let response = await BaseAPI.makeGetRequest(fullUri);
    // This is required for non-json responses, as the passthrough api
    // JSONifies them with the jsonified key
    const { data, headers } = response;
    const actual = data.jsonified || data;
    const { link: linkHeaders } = headers;
    const next = BaseAPI.getNextPages(linkHeaders);
    return { data: actual, ...next };
  }

  makeRemoteCall(uriPath) {
    const fullUri = this.buildUrl(uriPath);
    return BaseAPI.cacheOrGet(fullUri);
  }

  makeConditionalGet(uriPath, isPrivate) {
    return this.makeRemoteCall(uriPath);

    // Old auth logic
    //
    // if (this.isRemoteAuthorized(isPrivate)) {
    //   // If user is logged in with remote, we will send
    //   // this API call to pass through via backend.
    //   return this.makePassthrough(uriPath);
    // } else {
    //   // Make call directly to remote using client IP address
    //   // for efficient rate limit utilisation.
    //   return this.makeRemoteCall(uriPath);
    // }
  }

  getTreeCaller(repoDetails, page) {
    const { type } = repoDetails;

    switch (type) {
      case "pull":
        return this.getPRFiles(repoDetails, page);
      case "commit":
        return this.getCommitFiles(repoDetails);
      case "compare":
        return this.getCompareFiles(repoDetails);
      default:
        return this.getFilesTree(repoDetails);
    }
  }

  getTree(repoDetails) {
    return this.getTreeCaller(repoDetails, null);
  }

  async getTreePages(repoDetails, pages) {
    const callers = pages.map(page => this.getTreeCaller(repoDetails, page));
    const responses = await Promise.all(callers);
    return responses.reduce(
      (result: any, current: any) => result.concat(current.data),
      []
    );
  }

  abstract getRemoteUsername(decoded: string): string;

  abstract getPassthroughPath(): string;

  abstract buildUrl(path: string): string;

  abstract getPRFiles(repoDetails, page): any;

  abstract getFilesTree(repoDetails): any;

  abstract getCompareFiles(repoDetails): any;

  abstract getCommitFiles(repoDetails): any;

  abstract getPRInfov2(
    owner: string,
    name: string,
    pullRequestId: string
  ): Promise<{ base: RepoReference; head: RepoReference }>;
  abstract getBranchv2(
    owner: string,
    name: string,
    branch: string
  ): Promise<RepoReference>;
  abstract getCommitInfov2(
    owner: string,
    name: string,
    commitId: string
  ): Promise<{ base: RepoReference; head: RepoReference }>;
}

class GithubAPI extends BaseGitRemoteAPI {
  gh = new Octokit();

  constructor() {
    super();
    // TODO: remove this token
    this.gh.authenticate({
      type: "token",
      token: "88d6d887ac9b4c6ecd1c491c189d4b276e96aca5"
    });
  }

  getRemoteUsername(decoded) {
    return decoded.github_username;
  }

  getPassthroughPath() {
    return `github_passthrough/`;
  }

  buildUrl(path) {
    return `https://api.github.com/${path}`;
  }

  getPrivateErrorCodes() {
    return [401, 404];
  }

  getUrlBase(repoDetails) {
    const { username, reponame } = repoDetails;
    return `repos/${username}/${reponame}`;
  }

  getFilesTree(repoDetails) {
    const urlBase = this.getUrlBase(repoDetails);
    const { branch, isPrivate } = repoDetails;
    // TODO(arjun): check for default branch
    const nonNullBranch = branch || "master";
    const uriPath = `${urlBase}/git/trees/${nonNullBranch}?recursive=1`;
    return this.makeConditionalGet(uriPath, isPrivate);
  }

  getPRFiles(repoDetails, page) {
    const urlBase = this.getUrlBase(repoDetails);
    const { prId, isPrivate } = repoDetails;
    let pageParam = "";

    if (page) {
      pageParam = `?page=${page}`;
    }

    const uriPath = `${urlBase}/pulls/${prId}/files${pageParam}`;
    return this.makeConditionalGet(uriPath, isPrivate);
  }

  getCommitFiles(repoDetails) {
    const urlBase = this.getUrlBase(repoDetails);
    const { headSha, isPrivate } = repoDetails;
    const uriPath = `${urlBase}/commits/${headSha}`;
    return this.makeConditionalGet(uriPath, isPrivate).then(response => ({
      data: response.data.files
    }));
  }

  getCompareFiles(repoDetails) {
    const urlBase = this.getUrlBase(repoDetails);
    const { headSha, baseSha, isPrivate } = repoDetails;
    const uriPath = `${urlBase}/compare/${baseSha}...${headSha}`;
    return this.makeConditionalGet(uriPath, isPrivate).then(response => ({
      data: response.data.files
    }));
  }

  getPRInfo(repoDetails) {
    const urlBase = this.getUrlBase(repoDetails);
    const { isPrivate, prId } = repoDetails;
    const uriPath = `${urlBase}/pulls/${prId}`;
    return this.makeConditionalGet(uriPath, isPrivate);
  }

  async getPRInfov2(owner, name, pullRequestId: string) {
    const { data } = await this.gh.pullRequests.get({
      repo: name,
      owner,
      number: +pullRequestId
    });
    const service = "github" as "github";
    return {
      base: {
        user: data.base.repo.owner.login,
        name: data.base.repo.name,
        service,
        sha: data.base.sha,
        branch: data.base.ref
      },
      head: {
        user: data.head.repo.owner.login,
        name: data.head.repo.name,
        service,
        sha: data.head.sha,
        branch: data.head.ref
      }
    };
  }

  async getBranchv2(owner: string, name: string, branch: string) {
    const { data } = await this.gh.repos.getBranch({
      owner,
      repo: name,
      branch
    });
    return {
      user: owner,
      name,
      service: "github" as "github",
      sha: data.commit.sha,
      branch: data.name
    };
  }

  async getCommitInfov2(owner: string, name: string, commitSha: string) {
    const { data } = await this.gh.repos.getCommit({
      owner,
      repo: name,
      sha: commitSha
    });
    const service = "github" as "github";
    return {
      base: { user: owner, name, service, sha: data.parents[0].sha },
      head: { user: owner, name, service, sha: data.sha }
    };
  }
}

// class BitbucketAPI extends BaseGitRemoteAPI {
class BitbucketAPI {
  getRemoteUsername(decoded) {
    return decoded.bitbucket_username;
  }

  getPassthroughPath() {
    return `bitbucket_passthrough/`;
  }

  buildUrl(path) {
    return `https://api.bitbucket.org/2.0/${path}`;
  }

  getPrivateErrorCodes() {
    return [403];
  }

  getParsedDiff(rawDiff) {
    const parsedDiff = parse(rawDiff);
    return parsedDiff.map(element => {
      let status = "modified";
      let filename = element.to;

      if (element.to === "/dev/null") {
        status = "deleted";
        filename = element.from;
      } else if (element.from === "/dev/null") {
        status = "added";
      } else if (element.to !== element.from) {
        status = "renamed";
      }

      return {
        filename,
        status,
        additions: element.additions,
        deletions: element.deletions
      };
    });
  }

  // getPRFiles(repoDetails) {
  //   const { username, reponame, prId, isPrivate } = repoDetails;
  //   const uriPath = `repositories/${username}/${reponame}/pullrequests/${prId}/diff/`;
  //   return this.makeConditionalGet(uriPath, isPrivate).then(response => {
  //     return { data: this.getParsedDiff(response.data) };
  //   });
  // }

  getFilesTree(repoDetails) {}

  getPRInfo(repoDetails) {}

  getCommitFiles(repoDetails) {}

  getCompareFiles(repoDetails) {}

  getPRInfov2(repo: RepoReference, pullRequestId: string) {}
}

let remoteAPI: BaseGitRemoteAPI;

const gitService = getGitService();
// TODO: uncomment after bitbucket is ready to go
// remoteAPI = gitService === "bitbucket" ? new BitbucketAPI() : new GithubAPI();
remoteAPI = new GithubAPI();

export default remoteAPI;
export { getParameterByName } from "./utils";
