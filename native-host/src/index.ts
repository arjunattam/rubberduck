import { log } from "./logger";
import { TypeScriptServer, spawnServer } from "./tsServer";
const nativeMessage = require("chrome-native-messaging");

const VERSION = "0.1.0";

enum RequestType {
  Info = "INFO",
  Initialize = "INITIALIZE",
  Hover = "HOVER",
  Definition = "DEFINITION",
  References = "REFERENCES"
}

interface InitializePayload {
  rootUri: string;
}

interface LanguageQueryPayload {
  fileUri: string;
  line: number;
  character: number;
}

interface IMessage {
  id: string;
  type: RequestType;
  payload: object;
}

const serverProcess = spawnServer();
// TODO: tsServer can potentially die anytime, so check for that
// TODO: also when should we kill the process? can we listen for disconnected event?
const tsServer = new TypeScriptServer(serverProcess);

const transformInput = async (message: IMessage, push: any, done: any) => {
  log(`Received: ${JSON.stringify(message)}`);

  switch (message.type) {
    case RequestType.Info:
      push({ version: VERSION });
      done();
      break;
    case RequestType.Initialize:
      const initPayload = <InitializePayload>message.payload;
      push({
        result: await tsServer.initialize(message.id, initPayload.rootUri)
      });
      done();
      break;
    case RequestType.Hover:
      const hoverPayload = <LanguageQueryPayload>message.payload;
      push({
        result: await tsServer.hover(
          message.id,
          hoverPayload.fileUri,
          hoverPayload.line,
          hoverPayload.character
        )
      });
      done();
      break;
    case RequestType.Definition:
      const definitionPayload = <LanguageQueryPayload>message.payload;
      push({
        result: await tsServer.definition(
          message.id,
          definitionPayload.fileUri,
          definitionPayload.line,
          definitionPayload.character
        )
      });
      done();
      break;
    case RequestType.References:
      const refsPayload = <LanguageQueryPayload>message.payload;
      push({
        result: await tsServer.references(
          message.id,
          refsPayload.fileUri,
          refsPayload.line,
          refsPayload.character
        )
      });
      done();
      break;
  }
};

// Setup native messaging pipes
const input = new nativeMessage.Input();
const output = new nativeMessage.Output();
const transform = new nativeMessage.Transform(transformInput);

process.stdin
  .pipe(input)
  .pipe(transform)
  .pipe(output)
  .pipe(process.stdout);
