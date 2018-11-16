import { log } from "./logger";
import { TypeScriptServer, spawn } from "./tsServer";
const nativeMessage = require("chrome-native-messaging");

const VERSION = "0.1.0";

const input = new nativeMessage.Input();
const output = new nativeMessage.Output();

enum RequestType {
  Info = "INFO",
  Initialize = "INITIALIZE",
  Hover = "HOVER",
  Definition = "DEFINITION",
  References = "REFERENCES"
}

interface IMessage {
  type: RequestType;
  payload: object;
}

const transform = new nativeMessage.Transform(function(
  message: IMessage,
  push: any,
  done: any
) {
  log(`Received: ${JSON.stringify(message)}`);

  switch (message.type) {
    case RequestType.Info:
      push({ version: VERSION });
      done();
      break;
  }
});

process.stdin
  .pipe(input)
  .pipe(transform)
  .pipe(output)
  .pipe(process.stdout);

export const tsServer = TypeScriptServer;
export const tsSpawn = spawn;
