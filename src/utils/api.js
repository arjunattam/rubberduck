import { sendMessage, constructMessage } from "./chrome";
import Store from "../store";
import { Authorization } from "./authorization";
const axios = require("axios");

let envRootUrl = "https://www.codeview.io/";

if (process.env.REACT_APP_BACKEND_ENV === "local") {
  envRootUrl = "http://localhost:8000/";
}

export const rootUrl = envRootUrl;
export const baseApiUrl = "api/v1";

export const encodeQueryData = data => {
  let ret = [];
  for (let d in data)
    ret.push(encodeURIComponent(d) + "=" + encodeURIComponent(data[d]));
  return ret.join("&");
};

export const getParameterByName = (name, url) => {
  name = name.replace(/[\[\]]/g, "\\$&");
  var regex = new RegExp("[?&]" + name + "(=([^&#]*)|&|#|$)"),
    results = regex.exec(url);
  if (!results) return null;
  if (!results[2]) return "";
  return decodeURIComponent(results[2].replace(/\+/g, " "));
};

export class BaseRequest {
  baseRequest;
  constructor() {
    let baseURL = this.getAPIUrl();
    this.baseRequest = axios.create({
      baseURL: baseURL
    });
  }

  updateDefaultHeader(token) {
    if (token) {
      this.baseRequest.defaults.headers.common[
        "Authorization"
      ] = `token ${token}`;
    }
  }

  getAPIUrl() {
    return `${rootUrl}/`;
  }

  fetch(uri, params) {
    return this.baseRequest
      .get(uri, {
        params
      })
      .then(response => {
        return response.data ? response.data : response;
      });
  }

  post(uri, body) {
    return this.baseRequest.post(uri, body).then(response => {
      return response.data ? response.data : response;
    });
  }

  patch(uri, body) {
    return this.baseRequest.patch(uri, body).then(response => {
      return response.data ? response.data : response;
    });
  }

  remove(uri) {
    return this.baseRequest.delete(uri).then(response => {
      return response.data ? response.data : response;
    });
  }
}

export class BaseAPI {
  constructor() {
    this.baseRequest = new BaseRequest();
    this.baseURI = this.baseRequest.getAPIUrl();
    Store.subscribe(() => this.updateBaseRequest());
  }

  updateBaseRequest() {
    let token = Store.getState().storage.token;
    this.baseRequest.updateDefaultHeader(token);
  }

  backgroundPost(url, data, cb) {
    // Send message to background page to make HTTP call
    const message = constructMessage("HTTP_POST", { url: url, data: data });
    sendMessage(message, cb);
  }

  isGithubAuthorized() {
    const token = Store.getState().storage.token;
    const decoded = Authorization.decodeJWT(token);

    if (decoded !== null) return decoded.github_username !== "";
    else return false;
  }

  makeConditionalGet(uriPath) {
    if (this.isGithubAuthorized()) {
      // If user is logged in with github, we will send
      // this API call to pass through via backend.
      const uri = `github_passthrough/${uriPath.replace("?", "%3F")}/`;
      return this.baseRequest.fetch(uri);
    } else {
      // Make call directly to github using client IP address
      // for efficient rate limit utilisation.
      const uri = `https://api.github.com/${uriPath}`;
      return axios
        .get(uri, { headers: { Authorization: "" } })
        .then(response => {
          return response.data ? response.data : response;
        })
        .catch(error => {
          if (error.response.status >= 400 && error.response.status < 500) {
            console.log("Handle unauthenticated");
            Store.dispatch({
              type: "UPDATE_IS_UNAUTHENTICATED",
              isUnauthenticated: true
            });
          }
        });
    }
  }

  getFilesTree(username, reponame, branch) {
    const uriPath = `repos/${username}/${reponame}/git/trees/${branch}?recursive=1`;
    return this.makeConditionalGet(uriPath);
  }

  getPRFiles(username, reponame, pr) {
    const uriPath = `repos/${username}/${reponame}/pulls/${pr}/files`;
    return this.makeConditionalGet(uriPath);
  }

  getPRInfo(username, reponame, pr) {
    const uriPath = `repos/${username}/${reponame}/pulls/${pr}`;
    return this.makeConditionalGet(uriPath);
  }

  issueToken(clientId) {
    const uri = `${baseApiUrl}/token_issue/`;
    return this.baseRequest.post(uri, { client_id: clientId });
  }

  refreshTokenBackground(token) {
    const uri = `${baseApiUrl}/token_refresh/`;
    return this.baseRequest.post(uri, { token: token });
  }

  createPRSession(organisation, reponame, pull_request_id) {
    const uri = `${baseApiUrl}/sessions/`;
    return this.baseRequest.post(uri, {
      pull_request_id,
      organisation,
      name: reponame,
      service: "github"
    });
  }

  createCompareSession(organisation, reponame, head_sha, base_sha) {
    const uri = `${baseApiUrl}/sessions/`;
    return this.baseRequest.post(uri, {
      organisation,
      name: reponame,
      head_sha,
      base_sha,
      service: "github"
    });
  }

  getHover(sessionId, baseOrHead, filePath, lineNumber, charNumber) {
    const queryParams = {
      is_base_repo: baseOrHead === "base" ? "true" : "false",
      location_id: `${filePath}#L${lineNumber}#C${charNumber}`
    };
    const uri = `${baseApiUrl}/sessions/${sessionId}/hover/?${encodeQueryData(
      queryParams
    )}`;
    return this.baseRequest.fetch(uri);
  }

  getReferences(sessionId, baseOrHead, filePath, lineNumber, charNumber) {
    const queryParams = {
      is_base_repo: baseOrHead === "base" ? "true" : "false",
      location_id: `${filePath}#L${lineNumber}#C${charNumber}`
    };
    const uri = `${baseApiUrl}/sessions/${sessionId}/references/?${encodeQueryData(
      queryParams
    )}`;
    return this.baseRequest.fetch(uri);
  }

  getDefinition(sessionId, baseOrHead, filePath, lineNumber, charNumber) {
    const queryParams = {
      is_base_repo: baseOrHead === "base" ? "true" : "false",
      location_id: `${filePath}#L${lineNumber}#C${charNumber}`
    };
    const uri = `${baseApiUrl}/sessions/${sessionId}/definition/?${encodeQueryData(
      queryParams
    )}`;
    return this.baseRequest.fetch(uri);
  }
}

export const API = new BaseAPI();
