import axios, { AxiosInstance } from "axios";

export default class BaseRequest {
  rootUrl: string;
  baseRequest: AxiosInstance;

  constructor(rootUrl, token) {
    this.rootUrl = rootUrl;
    let baseURL = this.getAPIUrl();
    this.baseRequest = axios.create({
      baseURL: baseURL
    });
    this.updateDefaultHeader(token);
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
