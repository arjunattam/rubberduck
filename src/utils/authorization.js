// See docs/AUTHENTICATION.md for documentation
import { sendMessage, constructMessage } from "./chrome";
import { rootUrl } from "./api";
import { API } from "./api";
import { getGitService } from "../adapters";

const Moment = require("moment");
const JWT = require("jsonwebtoken");

const JWT_FINAL_EXPIRY = 60; // days
const JWT_REFRESH_WINDOW = 48; // hours

export class AuthUtils {
  generateClientId() {
    const randomPool = new Uint8Array(32);
    crypto.getRandomValues(randomPool);
    let hex = "";
    for (let i = 0; i < randomPool.length; ++i) {
      hex += randomPool[i].toString(16);
    }
    // E.g. db18458e2782b2b77e36769c569e263a53885a9944dd0a861e5064eac16f1a
    return hex;
  }

  decodeJWT(token) {
    return JWT.decode(token);
  }

  triggerOAuthFlow(jwt, cb) {
    const service = getGitService();
    let url;

    if (service === "github") {
      url = `${rootUrl}github_oauth/?token=${jwt}`;
    } else if (service === "bitbucket") {
      url = `${rootUrl}bitbucket_oauth/?token=${jwt}`;
    }

    const message = constructMessage("AUTH_TRIGGER", { url: url });
    sendMessage(message, cb);
  }

  triggerLogoutFlow(jwt, cb) {
    const service = getGitService();
    let url;

    if (service === "github") {
      url = `${rootUrl}github_oauth_logout/?token=${jwt}`;
    } else if (service === "bitbucket") {
      url = `${rootUrl}bitbucket_oauth_logout/?token=${jwt}`;
    }

    const message = constructMessage("AUTH_TRIGGER", { url: url });
    sendMessage(message, cb);
  }

  isTokenValid(token) {
    return !this.isTokenExpired(token);
  }

  isTokenExpired(token) {
    if (!token) {
      return true;
    }
    let decodedToken = JWT.decode(token);
    let tokenExpiryMoment = Moment.unix(decodedToken.exp);
    let currentMoment = Moment();
    return currentMoment.isSameOrAfter(tokenExpiryMoment, "second");
  }

  isTokenExpiringSoon(token) {
    if (!token) {
      return true;
    }
    let decodedToken = JWT.decode(token);
    let currentMoment = Moment();
    let tokenExpiryMoment = Moment.unix(decodedToken.exp);
    return tokenExpiryMoment.diff(currentMoment, "hours") < JWT_REFRESH_WINDOW;
  }

  isTokenRefreshExpiringSoon(token) {
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
  }

  issueToken(clientId) {
    clientId = clientId || this.generateClientId();
    return API.issueToken(clientId).then(response => {
      return response.token;
    });
  }

  refreshToken(existingToken) {
    return API.refreshToken(existingToken).then(response => {
      return response.token;
    });
  }

  handleTokenState(clientId, existingToken) {
    if (this.isTokenRefreshExpiringSoon(existingToken)) {
      // Refreshing will not help, let's just issue a new token
      return this.issueToken(clientId);
    }

    if (this.isTokenValid(existingToken)) {
      if (!this.isTokenExpiringSoon(existingToken)) {
        return new Promise(resolve => {
          resolve(existingToken);
        });
      } else {
        return this.refreshToken(existingToken);
      }
    } else {
      return this.issueToken(clientId);
    }
  }
}

export const Authorization = new AuthUtils();
