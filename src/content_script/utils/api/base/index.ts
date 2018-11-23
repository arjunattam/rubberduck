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
    const { lastModified, link, data: cachedResponse } = cached;

    // The authorization header needs to be reset because axios.create
    // is setting a default header. (Can clean this up)
    let headers = { Authorization: authHeader };

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
