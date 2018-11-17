const uuidv4 = require("uuid/v4");
const applicationId = "io.rubberduck.native";

class NativeMessenger {
  port: chrome.runtime.Port;
  callbackMap = new Map<string, any>();

  constructor() {
    this.port = chrome.runtime.connectNative(applicationId);
    // TODO: error handling here - what if we can't connect?
    this.port.onMessage.addListener(msg => this.onMessage(msg));
    this.port.onDisconnect.addListener(() => this.onDisconnect());
  }

  info(payload, callback) {
    this.send("INFO", payload, callback);
  }

  initialize(payload: InitializeParams, callback) {
    this.send(
      "INITIALIZE",
      {
        repo: payload.name,
        user: payload.organisation,
        service: payload.service
      },
      callback
    );
  }

  hover(payload: LanguageQueryParams, callback) {
    this.send("HOVER", payload, callback);
  }

  definition(payload: LanguageQueryParams, callback) {
    this.send("DEFINITION", payload, callback);
  }

  references(payload: LanguageQueryParams, callback) {
    this.send("REFERENCES", payload, callback);
  }

  contents(payload: { path: string }, callback) {
    this.send("FILE_CONTENTS", payload, callback);
  }

  private send(type: string, payload: any, callback) {
    const requestId = uuidv4();
    this.callbackMap.set(requestId, callback);
    this.port.postMessage({ type, payload, id: requestId });
  }

  private onMessage(message: any) {
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
