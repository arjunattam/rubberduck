import * as cp from "child_process";
import { Reader } from "./wireProtocol";
import { log } from "../logger";
import uuidv4 from "uuid/v4";

// https://github.com/theia-ide/typescript-language-server
const THEIA_LS_SERVER = {
  binary: "../node_modules/.bin/typescript-language-server",
  args: ["--stdio", "--log-level", "4", "--tsserver-log-file=ts-logs.txt"]
};

// https://github.com/sourcegraph/javascript-typescript-langserver
const SOURCEGRAPH_LS_SERVER = {
  binary: "../node_modules/.bin/javascript-typescript-stdio",
  args: []
};

const LS_SERVER = SOURCEGRAPH_LS_SERVER;

export const spawn = (): cp.ChildProcess => {
  return cp.spawn(LS_SERVER.binary, LS_SERVER.args, {
    stdio: ["pipe", "pipe", "pipe"]
  });
};

const toPath = (uriPath: string) => {
  return uriPath.replace("file://", "");
};

export class TypeScriptServer {
  private readonly reader: Reader<any>;

  constructor(private serverProcess: cp.ChildProcess) {
    this.reader = new Reader<any>(
      this.serverProcess.stdout,
      (msg: any) => this.handleMessage(msg),
      (error: any) => log(`Reader error: ${error}`)
    );

    this.serverProcess.on("exit", code => this.handleExit(code));
    this.serverProcess.on("error", error => this.handleError(error));
  }

  public write(request: object) {
    // TODO: handle case when the pipe is closed (process crashed)
    const msg = `${JSON.stringify(request)}\r\n`;
    const chunk = `Content-Length: ${msg.length}\r\n\r\n${msg}`;
    log(`Writing to server: ${chunk}`);
    this.serverProcess.stdin.write(chunk, "utf8");
  }

  sendRequest(method: string, params: object) {
    this.write({
      jsonrpc: "2.0",
      id: uuidv4(),
      method,
      params
    });
  }

  initialize(rootUri: string) {
    return this.sendRequest("initialize", {
      processId: process.pid,
      rootPath: toPath(rootUri),
      rootUri,
      initializationOptions: {},
      capabilities: { streaming: false }
    });
  }

  definition(fileUri: string, line: number, character: number) {
    return this.sendRequest("textDocument/definition", {
      textDocument: { uri: fileUri },
      position: { line, character }
    });
  }

  handleMessage(message: any) {
    if (message.method === "window/logMessage") {
      const { type, message: logMessage } = message.params;
      log(`Server logMessage: ${logMessage}`);
    } else {
      log(`Server handleMessage: ${JSON.stringify(message)}`);
    }
  }

  handleExit(code: any) {
    log(`Server exited with code: ${code}`);
  }

  handleError(error: any) {
    log(`Server error: ${error}`);
  }
}
