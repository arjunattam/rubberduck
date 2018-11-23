import axios from "axios";
import { AuthUtils } from "../../authorization";
import { apiResponsesCache } from "./cache";
import BaseRequest from "./base";

const linkParser = require("parse-link-header");

const BASE_API_PREFIX = "api/v1";

export class BaseAPI {
  makePostRequest = (uri, body) => {
    const rootUrl = AuthUtils.getBaseUrl();
    const token = AuthUtils.getToken();
    const baseRequest = new BaseRequest(rootUrl, token);
    return baseRequest.post(uri, body);
  };

  makeGetRequest = uri => {
    const rootUrl = AuthUtils.getBaseUrl();
    const token = AuthUtils.getToken();
    const baseRequest = new BaseRequest(rootUrl, token);
    return baseRequest.fetch(uri, undefined);
  };

  issueToken(clientId) {
    const uri = `${BASE_API_PREFIX}/token_issue/`;
    return this.makePostRequest(uri, { client_id: clientId }).then(
      response => response.data
    );
  }

  refreshToken(token) {
    const uri = `${BASE_API_PREFIX}/token_refresh/`;
    return this.makePostRequest(uri, { token: token }).then(
      response => response.data
    );
  }

  getNextPages(linkHeaders) {
    let next, last;
    if (linkHeaders) {
      const parsed = linkParser(linkHeaders);
      next = parsed.next ? +parsed.next.page : null;
      last = parsed.last ? +parsed.last.page : null;
    }
    let result: any = {};

    if (next) {
      result.nextPage = next;
    }

    if (last) {
      result.lastPage = last;
    }

    return result;
  }

  async cacheOrGet(uri) {
    const cached = apiResponsesCache.get(uri);
    const { lastModified, link, data: cachedResponse } = cached;

    // The authorization header needs to be reset because axios.create
    // is setting a default header. (Can clean this up)
    let headers = { Authorization: "" };

    if (lastModified && cachedResponse) {
      headers["If-Modified-Since"] = lastModified;
    }

    const options = {
      headers,
      validateStatus: status => status < 400
    };

    const response = await axios.get(uri, options);

    if (response.status === 304) {
      const lastModified = response.headers["last-modified"];
      await apiResponsesCache.update(uri, lastModified);
      const next = this.getNextPages(link);
      return { data: cachedResponse, ...next };
    } else {
      await apiResponsesCache.set(uri, response);
      const { link: linkHeaders } = response.headers;
      const next = this.getNextPages(linkHeaders);
      return { data: response.data, ...next };
    }
  }
}

export const API = new BaseAPI();
