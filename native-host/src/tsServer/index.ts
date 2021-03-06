import * as cp from "child_process";
import { Reader } from "./wireProtocol";
import { log } from "../logger";
import { CallbackMap } from "./callbackMap";
import { toPath } from "../utils";

export class TypeScriptServer {
  private readonly reader: Reader<any>;
  private callbacks = new CallbackMap();

  constructor(private serverProcess: cp.ChildProcess) {
    this.reader = new Reader<any>(
      this.serverProcess.stdout,
      (msg: any) => this.handleMessage(msg),
      (error: any) => log(`Reader error: ${error}`)
    );
  }

  initialize(reqId: string, rootUri: string) {
    return this.sendRequest(reqId, "initialize", {
      processId: process.pid,
      rootPath: toPath(rootUri),
      rootUri,
      initializationOptions: {},
      capabilities: { streaming: false }
    });
  }

  kill() {
    this.serverProcess.kill();
  }

  hover(reqId: string, fileUri: string, line: number, character: number) {
    return this.sendRequest(reqId, "textDocument/hover", {
      textDocument: { uri: fileUri },
      position: { line, character }
    });
  }

  definition(reqId: string, fileUri: string, line: number, character: number) {
    return this.sendRequest(reqId, "textDocument/definition", {
      textDocument: { uri: fileUri },
      position: { line, character }
    });
  }

  references(reqId: string, fileUri: string, line: number, character: number) {
    return this.sendRequest(reqId, "textDocument/references", {
      textDocument: { uri: fileUri },
      position: { line, character }
    });
  }

  private write(request: object) {
    // TODO: handle case when the pipe is closed (process crashed)
    const msg = `${JSON.stringify(request)}\r\n`;
    const chunk = `Content-Length: ${msg.length}\r\n\r\n${msg}`;
    log(`Writing to server: ${chunk}`);
    this.serverProcess.stdin.write(chunk, "utf8");
  }

  private sendRequest(requestId: string, method: string, params: object) {
    const request = {
      jsonrpc: "2.0",
      id: requestId,
      method,
      params
    };
    let result = new Promise((resolve, reject) => {
      this.callbacks.add(requestId, { onSuccess: resolve, onError: reject });
      this.write(request);
    });

    return result;
  }

  private handleMessage(message: any) {
    // Can potentially handle `window/logMessage` type differently for logging
    log(`Server handleMessage: ${JSON.stringify(message)}`);
    const { id: messageId } = message;
    const callback = this.callbacks.fetch(messageId);

    if (!callback) {
      return;
    }

    callback.onSuccess(message);
  }
}
