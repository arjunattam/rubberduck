import { TabRepoMap, RepoPayload } from "./tabRepoMap";
const uuidv4 = require("uuid/v4");
const applicationId = "io.rubberduck.native";

class NativeMessenger {
  port: chrome.runtime.Port;
  tabRepoMap = new TabRepoMap();
  callbackMap = new Map<string, any>();

  constructor() {
    this.port = chrome.runtime.connectNative(applicationId);

    // TODO: error handling here - what if we can't connect?
    this.port.onMessage.addListener(msg => this.onMessage(msg));
    this.port.onDisconnect.addListener(() => this.onDisconnect());
  }

  info(tabId, payload, callback) {
    this.send("INFO", payload, callback);
  }

  initialize(tabId, payload: InitializeParams, callback) {
    const repoPayload: RepoPayload = {
      name: payload.name,
      user: payload.organisation,
      service: payload.service,
      sha: "" // TODO: add this
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

    this.port.postMessage({ type, payload, id: requestId });
  }

  private onMessage(message: any) {
    console.log("Message from native:", message);
    const { id } = message;
    const callback = this.callbackMap.get(id);
    this.callbackMap.delete(id);
    callback(message);
  }

  private onDisconnect() {
    console.log("port disconnected");
  }
}

export default new NativeMessenger();
