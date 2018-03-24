import { sendMessage, constructMessage } from "../chrome";
import Store from "../../store";
import { Authorization } from "../authorization";

import BaseRequest from "./base";
import { encodeQueryData } from "./utils";
import { GitRemoteAPI } from "./remote";

export { encodeQueryData, getParameterByName } from "./utils";

const axios = require("axios");

let envRootUrl = "https://www.codeview.io/";

if (process.env.REACT_APP_BACKEND_ENV === "local") {
  envRootUrl = "http://localhost:8000/";
}

export const rootUrl = envRootUrl;
export const baseApiUrl = "api/v1";

export class BaseAPI {
  constructor() {
    this.baseRequest = new BaseRequest(rootUrl);
    this.baseURI = this.baseRequest.getAPIUrl();
    Store.subscribe(() => this.updateBaseRequest());
  }

  getDecodedToken() {
    const token = Store.getState().storage.token;
    return Authorization.decodeJWT(token);
  }

  updateBaseRequest() {
    let token = Store.getState().storage.token;
    this.baseRequest.updateDefaultHeader(token);
  }

  dispatchAuthenticated(isAuthenticated) {
    Store.dispatch({
      type: "UPDATE_IS_UNAUTHENTICATED",
      isUnauthenticated: !isAuthenticated
    });
  }

  issueToken(clientId) {
    const uri = `${baseApiUrl}/token_issue/`;
    return this.baseRequest.post(uri, { client_id: clientId });
  }

  refreshToken(token) {
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

Object.assign(BaseAPI.prototype, GitRemoteAPI);

export const API = new BaseAPI();
