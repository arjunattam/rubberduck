import fs from "fs";
const LOG_FILE = "debug.log";

export const log = (content: any) => {
  const date = new Date();
  const withDate = `[${date.toISOString()}]: ${content}\n`;
  fs.appendFileSync(LOG_FILE, withDate);
};
