import { sendMessageToAllTabs } from "../../utils";

const RECONNECT_DURATION = 30 * 1000; // seconds
const applicationId = "io.rubberduck.native";

export class NativePort {
  port: chrome.runtime.Port | undefined;
  isConnected: boolean = false;

  constructor(private onMessageListener: any) {}

  async connect() {
    return new Promise((resolve, reject) => {
      this.port = chrome.runtime.connectNative(applicationId);
      this.port.onDisconnect.addListener(() => this.onDisconnect());

      this.port.onMessage.addListener(message => {
        console.log("Message from native:", message);

        if (message.status === "CONNECTED") {
          // handle for the ack message
          this.isConnected = true;
          sendMessageToAllTabs("NATIVE_CONNECTED", {});
          resolve();
        } else {
          this.onMessageListener(message);
        }
      });
    });
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
    sendMessageToAllTabs("NATIVE_DISCONNECTED", {});
    setTimeout(() => this.connect(), RECONNECT_DURATION);
  }

  async send(payload: any) {
    if (!this.isConnected) {
      await this.connect();
    }

    if (!!this.port) {
      try {
        return this.port.postMessage(payload);
      } catch (error) {
        console.log("error", error);
      }
    }
  }
}
