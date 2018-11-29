import axios from "axios";
import { apiResponsesCache } from "./cache";

const linkParser = require("parse-link-header");

export class BaseAPI {
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

  async get(uri, authHeader) {
    const cached = apiResponsesCache.get(uri);
    const {
      lastModified: cachedLastModified,
      link: cachedLink,
      data: cachedResponse
    } = cached;

    // The authorization header needs to be reset because axios.create
    // is setting a default header. (Can clean this up)
    let headers = { Authorization: authHeader };

    if (cachedLastModified && cachedResponse) {
      headers["If-Modified-Since"] = cachedLastModified;
    }

    const requestOptions = {
      headers,
      validateStatus: status => status < 400
    };

    const response = await axios.get(uri, requestOptions);
    let data, linkHeaders;

    if (response.status === 304) {
      const lastModified = response.headers["last-modified"];
      await apiResponsesCache.update(uri, lastModified);
      data = cachedResponse;
      linkHeaders = cachedLink;
    } else {
      await apiResponsesCache.set(uri, response);
      data = response.data;
      linkHeaders = response.headers.link;
    }

    const next = this.getNextPages(linkHeaders);
    return { data, ...next };
  }
}

export const API = new BaseAPI();
