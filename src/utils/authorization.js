// See docs/AUTHENTICATION.md for documentation

import { API, getParameterByName } from "./api";
import { setInStore, getFromStore } from "./storage";
import { sendMessage, constructMessage } from "./chrome";
import * as AuthActions from "../actions/authActions";
const jwt = require("jsonwebtoken");

export class AuthUtils {
  constructor() {}

  initialize(storeDispatch) {
    this.dispatch = storeDispatch;
    this.getClientId().then(clientId => {
      return this.getJWT(clientId).then(jwt => {
        return {
          clientId,
          jwt
        };
      });
    });
    // this.getClientId()
    //   .then(clientId => this.getJWT(clientId))
    //   .then(token => this.updateJWT(token));
  }

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
    return jwt.decode(token);
  }

  triggerOAuthFlow(jwt, cb) {
    const url = "https://www.codeview.io/github_oauth/?token=" + jwt;
    const message = constructMessage("AUTH_TRIGGER", { url: url });
    sendMessage(message, cb);
  }

  getClientId() {
    // This methods attempts to get the client_id from chrome.storage
    const key = "client_id";
    return new Promise((resolve, reject) => {
      getFromStore(key, value => {
        if (value === null) {
          // This means we need to create a value and store it in redux and chrome store.
          const clientId = this.generateClientId();
          setInStore(key, clientId, () => {
            resolve(clientId);
          });
        } else {
          // Value exists, we can just update it in store and resolve it
          resolve(value);
        }
      });
    });
  }

  getJWT(clientId) {
    // This methods attempts to get the token from storage,
    // if not found, makes an API call
    const key = "token";

    return new Promise((resolve, reject) => {
      getFromStore(key, value => {
        // null means we need to make API call to server and fetch jwt
        if (value === null) {
          // Cannot use axios http call because domain is not https
          /* issueToken(clientId) */
          API.issueTokenBackground(clientId, response => {
            const token = response.token;
            resolve(token);
          });
        } else {
          // We found a token in the chrome storage, and will refresh it
          this.refreshToken(value, resolve);
        }
      });
    });
  }

  updateJWT(token) {
    // When token has been received, we will save to storage
    const key = "token";
    setInStore(key, token, () => {
      this.dispatch(AuthActions.updateJWT(token));
    });
  }

  refreshToken(existingToken, callback) {
    // Use the existing jwt to get a refreshed token, with
    // an extended expiry. To be safe, this is triggered on every component
    // load for now. The jwt expiry is set at 3 days in the backend.
    API.refreshTokenBackground(existingToken, response => {
      const token = response.token;
      callback(token);
    });
    // TODO(arjun): this will raise an error if the refresh fails,
    // in which case we will have to re-issue the token flow.
  }
}

export const Authorization = new AuthUtils();
