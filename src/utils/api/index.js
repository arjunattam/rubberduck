import Store from "../../store";
import { bindActionCreators } from "redux";
import * as DataActions from "../../actions/dataActions";

import BaseRequest from "./base";
import { Authorization } from "../authorization";
import { rootUrl, baseApiUrl } from "./url";
import { GitRemoteAPI } from "./remote";

export class BaseAPI {
  constructor() {
    this.baseRequest = new BaseRequest(rootUrl);
    this.baseURI = this.baseRequest.getAPIUrl();
    Store.subscribe(() => this.updateBaseRequest());
    this.DataActions = bindActionCreators(DataActions, Store.dispatch);
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
    this.DataActions.updateData({
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
export { getParameterByName } from "./utils";
export { rootUrl };
