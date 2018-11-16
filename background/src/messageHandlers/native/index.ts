const applicationId = "io.rubberduck.native";

// Sends and receives messages from native app
export class NativeMessenger {
  port: chrome.runtime.Port;

  constructor() {
    // TODO: error handling here - what if we can't connect?
    this.port = chrome.runtime.connectNative(applicationId);
    this.port.onMessage.addListener(msg => this.onMessage(msg));
    this.port.onDisconnect.addListener(() => this.onDisconnect());
  }

  send(type: string, payload: any) {
    // TODO: Generate a uuid here
    this.port.postMessage({ type, payload });
  }

  onMessage(message: any) {}

  onDisconnect() {
    //
    console.log("port disconnected");
  }
}
