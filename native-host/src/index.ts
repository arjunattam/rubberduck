import { log } from "./logger";
import { MessageHandler } from "./messageHandler";
const nativeMessage = require("chrome-native-messaging");

const messageHandler = new MessageHandler();

const transformInput = async (message: Message, push: any, done: any) => {
  log(`Received: ${JSON.stringify(message)}`);
  let response;

  try {
    response = await messageHandler.handle(message);
  } catch (error) {
    response = {
      id: message.id,
      error
    };
  }

  log(`Responding: ${JSON.stringify(response)}`);
  push(response);
  done();
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
