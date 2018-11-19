import { TabRepoMap, RepoPayload } from "./tabRepoMap";
import { NativePort } from "./port";
const uuidv4 = require("uuid/v4");

class NativeMessenger {
  port = new NativePort(msg => this.onMessage(msg));
  tabRepoMap = new TabRepoMap();
  callbackMap = new Map<string, any>();

  constructor() {
    this.port.connect();
  }

  info(tabId, payload, callback) {
    const portInfo = this.port.info();
    this.send("INFO", payload, payload =>
      callback({ ...payload, port: portInfo })
    );
  }

  cloneAndCheckout(tabId, payload: InitializeParams, callback) {
    const repoPayload: RepoPayload = {
      name: payload.name,
      user: payload.organisation,
      service: payload.service,
      sha: payload.head_sha
    };
    this.send("CLONE_AND_CHECKOUT", repoPayload, callback);
  }

  initialize(tabId, payload: InitializeParams, callback) {
    const repoPayload: RepoPayload = {
      name: payload.name,
      user: payload.organisation,
      service: payload.service,
      sha: payload.head_sha
    };

    // TODO: two incorrect assumptions here
    // 1. repo payload cannot change for a tab (what if i change branches)
    // 2. one tab can have just one payload (not true for PRs)
    this.tabRepoMap.set(tabId, repoPayload);
    this.send("INITIALIZE", repoPayload, callback);
  }

  onTabClosed(tabId) {
    // When all tabs of the same repo payload have closed,
    // we can kill the language server
    const repoInfo = this.tabRepoMap.get(tabId);

    if (!!repoInfo) {
      // If this was the only tab for this repo
      // we should kill the server (via EXIT message)
      this.tabRepoMap.delete(tabId);

      if (!this.tabRepoMap.hasTabForRepo(repoInfo)) {
        this.send("EXIT", repoInfo, undefined);
      }
    }
  }

  hover(tabId, payload: LanguageQueryParams, callback) {
    this.send(
      "HOVER",
      { repo: this.tabRepoMap.get(tabId), query: payload },
      callback
    );
  }

  definition(tabId, payload: LanguageQueryParams, callback) {
    this.send(
      "DEFINITION",
      { repo: this.tabRepoMap.get(tabId), query: payload },
      callback
    );
  }

  references(tabId, payload: LanguageQueryParams, callback) {
    this.send(
      "REFERENCES",
      { repo: this.tabRepoMap.get(tabId), query: payload },
      callback
    );
  }

  contents(tabId, payload: { path: string }, callback) {
    this.send(
      "FILE_CONTENTS",
      { repo: this.tabRepoMap.get(tabId), query: payload },
      callback
    );
  }

  private send(type: string, payload: any, callback) {
    const requestId = uuidv4();

    if (!!callback) {
      this.callbackMap.set(requestId, callback);
    }

    this.port.send({ type, payload, id: requestId });
  }

  private onMessage(message: any) {
    console.log("Message from native:", message);
    const { id } = message;
    const callback = this.callbackMap.get(id);

    if (!!callback) {
      this.callbackMap.delete(id);
      callback(message);
    } else {
      console.log("No callback found!");
    }
  }
}

export default new NativeMessenger();
