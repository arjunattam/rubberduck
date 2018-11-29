import { NativePort } from "./port";
const uuidv4 = require("uuid/v4");

class NativeMessenger {
  port = new NativePort(msg => this.onMessage(msg));
  callbackMap = new Map<string, any>();

  constructor() {
    this.port.connect();
  }

  info(tabId, payload, callback) {
    this.send("INFO", payload, payload => {
      const portInfo = this.port.info();
      callback({ ...payload, port: portInfo });
    });
  }

  cloneAndCheckout(tabId, payload, callback) {
    this.send("CLONE_AND_CHECKOUT", payload, callback);
  }

  initialize(tabId, payload: RepoReference, callback) {
    this.send("INITIALIZE", payload, callback);
  }

  hover(tabId, payload: LanguageQueryParams, callback) {
    this.send("HOVER", payload, callback);
  }

  definition(tabId, payload: LanguageQueryParams, callback) {
    this.send("DEFINITION", payload, callback);
  }

  references(tabId, payload: LanguageQueryParams, callback) {
    this.send("REFERENCES", payload, callback);
  }

  contents(tabId, payload, callback) {
    this.send("FILE_CONTENTS", payload, callback);
  }

  private async send(type: string, payload: any, callback) {
    const requestId = uuidv4();

    if (!!callback) {
      this.callbackMap.set(requestId, callback);
    }

    await this.port.send({ type, payload, id: requestId });
  }

  private onMessage(message: any) {
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
