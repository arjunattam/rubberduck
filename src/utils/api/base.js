import axiosRetry from "axios-retry";

const axios = require("axios");

const RETRY_LIMIT = 100;

export default class BaseRequest {
  constructor(rootUrl) {
    this.rootUrl = rootUrl;
    let baseURL = this.getAPIUrl();
    this.baseRequest = axios.create({
      baseURL: baseURL
    });
    axiosRetry(this.baseRequest, {
      retryDelay: axiosRetry.exponentialDelay,
      retries: RETRY_LIMIT
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
    return `${this.rootUrl}/`;
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
