// See docs/AUTHENTICATION.md for documentation
import { sendMessage, constructMessage } from "./chrome";
import { rootUrl } from "./api";
import { API } from "./api";
import { getGitService } from "../adapters";
const Moment = require("moment");

const JWT = require("jsonwebtoken");

export class AuthUtils {
  generateClientId() {
    // E.g. 8 * 32 = 256 bits token
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

  isTokenExpired(token) {
    if (!token) {
      return true;
    }
    let decodedToken = JWT.decode(token);
    let tokenExpiryMoment = Moment.unix(decodedToken.exp);
    let currentMoment = Moment();
    if (currentMoment.isSameOrAfter(tokenExpiryMoment, "second")) {
      return true;
    }
    return false;
  }

  isTokenExpiring(token) {
    if (!token) {
      return true;
    }
    let decodedToken = JWT.decode(token);
    let currentMoment = Moment();
    let tokenExpiryMoment = Moment.unix(decodedToken.exp);
    if (tokenExpiryMoment.diff(currentMoment, "hours") < 24) {
      return true;
    }
    return false;
  }

  isTokenRefreshExpiring(token) {
    if (!token) {
      return true;
    }
    let decodedToken = JWT.decode(token);
    let currentMoment = Moment();
    let tokenOriginalIssueMoment = Moment.unix(decodedToken.orig_iat);
    let tokenExpiryMoment = Moment.unix(decodedToken.exp);
    let tokenRefreshExpiryMoment = Moment(tokenOriginalIssueMoment).add(
      30,
      "days"
    );
    if (tokenRefreshExpiryMoment.diff(currentMoment, "hours") < 24) {
      return true;
    }
    return false;
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
    if (
      !existingToken ||
      this.isTokenExpired(existingToken) ||
      this.isTokenRefreshExpiring(existingToken)
    ) {
      return this.issueToken(clientId);
    } else if (this.isTokenExpiring(existingToken)) {
      return this.refreshToken(existingToken);
    } else {
      return new Promise(resolve => {
        resolve(existingToken);
      });
    }
  }
}

export const Authorization = new AuthUtils();
