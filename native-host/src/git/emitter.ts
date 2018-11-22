import { log } from "../logger";

const EventEmitter = require("events");
export const emitter = new EventEmitter();

emitter.on("message", (message: any) => {
  log(`message: ${message}`);
});

emitter.on("progress", (message: any) => {
  // message is a ProgressEvent, with the following fields
  const { loaded, total, lengthComputable } = message;
});
