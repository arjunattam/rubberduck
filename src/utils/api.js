import { sendMessage, constructMessage } from "./chrome";
import Store from "../store";
const axios = require("axios");

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
    let baseURL = `http://localhost:8000/api/`;
    // if (process.env.NODE_ENV === "production") {
    baseURL = `https://www.codeview.io/api/`;
    // }
    return baseURL;
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

  getFilesTree(username, reponame) {
    const uri =
      "/repos/" + username + "/" + reponame + "/git/trees/master?recursive=1";
    return axios.get("https://api.github.com" + uri, {
      // TODO(arjun): replace this with the github token
      headers: {
        Authorization: "token 111ab37ff1337fc2ab25cc86c96f01981a8e7c4f"
      }
    });
  }

  issueTokenBackground(clientId, cb) {
    const uri = `/token_issue/`;
    return this.baseRequest.post(uri, { client_id: clientId });
    // return this.backgroundPost(uri, { client_id: clientId }, cb);
  }

  refreshTokenBackground(token, cb) {
    const uri = `/token_refresh/`;
    return this.baseRequest.post(uri, { token: token });
    // return this.backgroundPost(uri, { token: token }, cb);
  }

  issueToken(clientId) {
    const uri = "/token_issue/";
    return this.baseRequest.post(uri, { client_id: clientId });
  }

  createSession(pull_request_id, organisation, reponame) {
    const uri = "/sessions/";
    return this.baseRequest.post(uri, {
      pull_request_id,
      organisation,
      name: reponame
    });
  }

  getHover(sessionId, baseOrHead, filePath, lineNumber, charNumber) {
    const queryParams = {
      is_base_repo: baseOrHead === "base" ? "true" : "false",
      location_id: `${filePath}#L${lineNumber}#C${charNumber}`
    };
    const uri = `sessions/${sessionId}/hover/?${encodeQueryData(queryParams)}`;
    return this.baseRequest.fetch(uri);
  }

  getReferences(sessionId, baseOrHead, filePath, lineNumber, charNumber) {
    const queryParams = {
      is_base_repo: baseOrHead === "base" ? "true" : "false",
      location_id: `${filePath}#L${lineNumber}#C${charNumber}`
    };
    const uri = `sessions/${sessionId}/references/?${encodeQueryData(
      queryParams
    )}`;
    return this.baseRequest.fetch(uri);
  }

  getDefinition(sessionId, baseOrHead, filePath, lineNumber, charNumber) {
    const queryParams = {
      is_base_repo: baseOrHead === "base" ? "true" : "false",
      location_id: `${filePath}#L${lineNumber}#C${charNumber}`
    };
    const uri = `sessions/${sessionId}/definition/?${encodeQueryData(
      queryParams
    )}`;
    return this.baseRequest.fetch(uri);
  }
}

export const API = new BaseAPI();
