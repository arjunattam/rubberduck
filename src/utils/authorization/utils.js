// See docs/AUTHENTICATION.md for documentation
import { sendMessage, constructMessage } from "../chrome";
import { API } from "../api";
import { getGitService } from "../../adapters";

const Moment = require("moment");
const JWT = require("jsonwebtoken");

const JWT_FINAL_EXPIRY = 60; // days
const JWT_REFRESH_WINDOW = 48; // hours

export const generateClientId = () => {
  const randomPool = new Uint8Array(32);
  crypto.getRandomValues(randomPool);
  let hex = "";
  for (let i = 0; i < randomPool.length; ++i) {
    hex += randomPool[i].toString(16);
  }
  // E.g. db18458e2782b2b77e36769c569e263a53885a9944dd0a861e5064eac16f1a
  return hex;
};

export const decodeJWT = token => {
  return JWT.decode(token);
};

export const triggerOAuthFlow = (rootUrl, jwt, cb) => {
  const service = getGitService();
  let url;

  if (service === "github") {
    url = `${rootUrl}github_oauth/?token=${jwt}`;
  } else if (service === "bitbucket") {
    url = `${rootUrl}bitbucket_oauth/?token=${jwt}`;
  }

  const message = constructMessage("AUTH_TRIGGER", { url: url });
  sendMessage(message, cb);
};

export const triggerLogoutFlow = (rootUrl, jwt, cb) => {
  const service = getGitService();
  let url;

  if (service === "github") {
    url = `${rootUrl}github_oauth_logout/?token=${jwt}`;
  } else if (service === "bitbucket") {
    url = `${rootUrl}bitbucket_oauth_logout/?token=${jwt}`;
  }

  const message = constructMessage("AUTH_TRIGGER", { url: url });
  sendMessage(message, cb);
};

export const isTokenValid = token => {
  return !isTokenExpired(token);
};

const isTokenExpired = token => {
  if (!token) {
    return true;
  }
  let decodedToken = JWT.decode(token);
  let tokenExpiryMoment = Moment.unix(decodedToken.exp);
  let currentMoment = Moment();
  return currentMoment.isSameOrAfter(tokenExpiryMoment, "second");
};

const isTokenExpiringSoon = token => {
  if (!token) {
    return true;
  }
  let decodedToken = JWT.decode(token);
  let currentMoment = Moment();
  let tokenExpiryMoment = Moment.unix(decodedToken.exp);
  return tokenExpiryMoment.diff(currentMoment, "hours") < JWT_REFRESH_WINDOW;
};

const isTokenRefreshExpiringSoon = token => {
  if (!token) {
    return true;
  }
  let decodedToken = JWT.decode(token);
  let currentMoment = Moment();
  let tokenOriginalIssueMoment = Moment.unix(decodedToken.orig_iat);
  let tokenRefreshExpiryMoment = Moment(tokenOriginalIssueMoment).add(
    JWT_FINAL_EXPIRY,
    "days"
  );
  return (
    tokenRefreshExpiryMoment.diff(currentMoment, "hours") < JWT_REFRESH_WINDOW
  );
};

const issueToken = clientId => {
  clientId = clientId || generateClientId();
  return API.issueToken(clientId).then(response => {
    return response.token;
  });
};

const refreshToken = existingToken => {
  return API.refreshToken(existingToken).then(response => {
    return response.token;
  });
};

export const handleTokenState = (clientId, existingToken) => {
  if (isTokenRefreshExpiringSoon(existingToken)) {
    // Refreshing will not help, let's just issue a new token
    return issueToken(clientId);
  }

  if (isTokenValid(existingToken)) {
    if (!isTokenExpiringSoon(existingToken)) {
      return new Promise(resolve => {
        resolve(existingToken);
      });
    } else {
      return refreshToken(existingToken);
    }
  } else {
    return issueToken(clientId);
  }
};

export const updateChromePermissions = urls => {};
