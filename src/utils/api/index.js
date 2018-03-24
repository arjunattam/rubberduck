import { sendMessage, constructMessage } from "../chrome";
import Store from "../../store";
import { Authorization } from "../authorization";

import BaseRequest from "./base";
import { rootUrl, baseApiUrl } from "./url";
import { encodeQueryData } from "./utils";
import { GitRemoteAPI } from "./remote";

const axios = require("axios");

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
}

Object.assign(BaseAPI.prototype, GitRemoteAPI);

export const API = new BaseAPI();
export { encodeQueryData, getParameterByName } from "./utils";
export { rootUrl };
