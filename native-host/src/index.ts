import { log } from "./logger";
import { TypeScriptServer, spawnServer } from "./tsServer";
import { readFile, constructFileUri, constructRootUri, clean } from "./utils";
const nativeMessage = require("chrome-native-messaging");

const VERSION = "0.1.0";

enum RequestType {
  Info = "INFO",
  Initialize = "INITIALIZE",
  Hover = "HOVER",
  Definition = "DEFINITION",
  References = "REFERENCES",
  FileContents = "FILE_CONTENTS"
}

interface InitializePayload {
  // TODO: add sha support here
  user: string;
  repo: string;
  service: string;
}

interface LanguageQueryPayload {
  path: string;
  sha: string;
  line: number;
  character: number;
}

interface FileContentsPayload {
  path: string;
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

  const sendResponse = (response: any) => {
    const result = clean(response);
    log(`Responding: ${JSON.stringify(result)}`);
    push(result);
  };

  switch (message.type) {
    case RequestType.Info:
      sendResponse({ version: VERSION, id: message.id });
      done();
      break;
    case RequestType.Initialize:
      const initPayload = <InitializePayload>message.payload;
      sendResponse(
        await tsServer.initialize(
          message.id,
          constructRootUri(initPayload.repo)
        )
      );
      done();
      break;
    case RequestType.Hover:
      const hoverPayload = <LanguageQueryPayload>message.payload;
      sendResponse(
        await tsServer.hover(
          message.id,
          constructFileUri(hoverPayload.path),
          hoverPayload.line,
          hoverPayload.character
        )
      );
      done();
      break;
    case RequestType.Definition:
      const defPayload = <LanguageQueryPayload>message.payload;
      sendResponse(
        await tsServer.definition(
          message.id,
          constructFileUri(defPayload.path),
          defPayload.line,
          defPayload.character
        )
      );
      done();
      break;
    case RequestType.References:
      const refsPayload = <LanguageQueryPayload>message.payload;
      sendResponse(
        await tsServer.references(
          message.id,
          constructFileUri(refsPayload.path),
          refsPayload.line,
          refsPayload.character
        )
      );
      done();
      break;
    case RequestType.FileContents:
      const filePayload = <FileContentsPayload>message.payload;
      sendResponse({
        contents: await readFile(constructFileUri(filePayload.path)),
        id: message.id
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
