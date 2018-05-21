import axios from "axios";
import axiosRetry from "axios-retry";

const RETRY_LIMIT = 100;

export default class BaseRequest {
  constructor(rootUrl) {
    this.rootUrl = rootUrl;
    let baseURL = this.getAPIUrl();
    this.baseRequest = axios.create({
      baseURL: baseURL
    });

    // Need to write this because it fails in tests (!?) due to mock axios
    try {
      axiosRetry(this.baseRequest, {
        retryDelay: axiosRetry.exponentialDelay,
        retries: RETRY_LIMIT
      });
    } catch (e) {}
  }

  updateDefaultHeader(token) {
    if (token) {
      this.baseRequest.defaults.headers.common[
        "Authorization"
      ] = `token ${token}`;
    }
  }

  getAPIUrl() {
    return `${this.rootUrl}/`;
  }

  fetch(uri, params) {
    return this.baseRequest.get(uri, {
      params
    });
  }

  post(uri, body) {
    return this.baseRequest.post(uri, body);
  }

  patch(uri, body) {
    return this.baseRequest.patch(uri, body);
  }

  remove(uri) {
    return this.baseRequest.delete(uri);
  }
}
