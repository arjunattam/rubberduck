const applicationId = "io.rubberduck.native";

export class NativePort {
  port: chrome.runtime.Port | undefined;
  isConnected: boolean = false;

  constructor(private onMessageListener: any) {}

  connect() {
    this.port = chrome.runtime.connectNative(applicationId);
    this.isConnected = true;
    this.port.onMessage.addListener(this.onMessageListener);
    this.port.onDisconnect.addListener(() => this.onDisconnect());
  }

  info() {
    return {
      name: !!this.port ? this.port.name : undefined,
      isConnected: this.isConnected
    };
  }

  onDisconnect() {
    this.isConnected = false;
    console.log("Disconnected to native port, attempting reconnection");
    this.connect(); // TODO: if binary is not available --> infinite loop
  }

  send(payload: any) {
    try {
      if (!!this.port) {
        return this.port.postMessage(payload);
      }
    } catch (error) {
      console.log("error", error);
    }
  }
}
