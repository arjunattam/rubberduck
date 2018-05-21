import axios from "axios";
import Moment from "moment";
import Store from "../../store";
import { bindActionCreators } from "redux";
import * as DataActions from "../../actions/dataActions";

import BaseRequest from "./base";
import { Authorization } from "../authorization";
import { rootUrl, baseApiUrl } from "./url";
import GitRemoteAPI from "./remote";
import { hash } from "../data";
import * as StorageUtils from "../storage";

const linkParser = require("parse-link-header");

const CACHED_EXPIRY = 3; // hours
const IS_CACHING_ENABLED = true;

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
    return this.baseRequest
      .post(uri, { client_id: clientId })
      .then(response => response.data);
  }

  refreshToken(token) {
    const uri = `${baseApiUrl}/token_refresh/`;
    return this.baseRequest
      .post(uri, { token: token })
      .then(response => response.data);
  }

  getCached(uri) {
    const encoded = hash(uri);
    const { storage } = Store.getState();
    return storage.apiResponses[encoded] || {};
  }

  clearCache(existingCache) {
    const now = Moment.now();

    let filteredObject = Object.keys(existingCache).reduce((res, key) => {
      const keyExpiry = existingCache[key].expiry;
      const isValid = Moment(keyExpiry).isAfter(now);
      if (isValid) res[key] = existingCache[key];
      return res;
    }, {});

    return filteredObject;
  }

  updateCache(uri, lastModified) {
    const encoded = hash(uri);
    const { storage } = Store.getState();
    let apiResponses = storage.apiResponses;
    apiResponses[encoded] = { ...apiResponses[encoded], lastModified };
    StorageUtils.setInLocalStore({ apiResponses }, () => {});
  }

  setCached(uri, response) {
    const encoded = hash(uri);
    const lastModified = response.headers["last-modified"];
    const link = response.headers["link"];
    const { data } = response;
    const expiry = Moment()
      .add(CACHED_EXPIRY, "hours")
      .format();
    const { storage } = Store.getState();

    if (lastModified && data) {
      let apiResponses = this.clearCache(storage.apiResponses);
      apiResponses[encoded] = { lastModified, data, expiry, link };
      StorageUtils.setInLocalStore({ apiResponses }, () => {});
    }
  }

  getNextPages(linkHeaders) {
    let next, last;
    if (linkHeaders) {
      const parsed = linkParser(linkHeaders);
      next = parsed.next ? +parsed.next.page : null;
      last = parsed.last ? +parsed.last.page : null;
    }
    let result = {};
    if (next) {
      result.nextPage = next;
    }
    if (last) {
      result.lastPage = last;
    }
    return result;
  }

  cacheOrGet(uri) {
    const cached = this.getCached(uri);
    const { lastModified, link, data: cachedResponse } = cached;
    // The authorization header needs to be reset because axios.create
    // is setting a default header. (Can clean this up)
    let headers = { Authorization: "" };

    if (lastModified && cachedResponse && IS_CACHING_ENABLED) {
      headers["If-Modified-Since"] = lastModified;
    }

    const options = {
      headers,
      validateStatus: status => status < 400
    };

    return axios.get(uri, options).then(response => {
      if (response.status === 304) {
        const lastModified = response.headers["last-modified"];
        this.updateCache(uri, lastModified);
        const next = this.getNextPages(link);
        return { data: cachedResponse, ...next };
      } else {
        this.setCached(uri, response);
        const { link: linkHeaders } = response.headers;
        const next = this.getNextPages(linkHeaders);
        return { data: response.data, ...next };
      }
    });
  }
}

Object.assign(BaseAPI.prototype, GitRemoteAPI);

export const API = new BaseAPI();
export { getParameterByName } from "./utils";
export { rootUrl };
