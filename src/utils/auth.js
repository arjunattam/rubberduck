// See docs/AUTHENTICATION.md for documentation
import { sendMessage, constructMessage } from "./chrome";
var jwt = require("jsonwebtoken");

export const getRandomToken = () => {
  // E.g. 8 * 32 = 256 bits token
  const randomPool = new Uint8Array(32);
  crypto.getRandomValues(randomPool);
  let hex = "";
  for (let i = 0; i < randomPool.length; ++i) {
    hex += randomPool[i].toString(16);
  }
  // E.g. db18458e2782b2b77e36769c569e263a53885a9944dd0a861e5064eac16f1a
  return hex;
};

export const triggerOAuthFlow = (jwt, cb) => {
  const url = "https://www.codeview.io/github_oauth/?token=" + jwt;
  const message = constructMessage("AUTH_TRIGGER", { url: url });
  sendMessage(message, cb);
};

export const decodeJWT = token => {
  return jwt.decode(token);
};
