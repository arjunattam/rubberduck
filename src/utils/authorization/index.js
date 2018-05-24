import Store from "../../store";
import * as AuthUtils from "./utils";
import * as StorageUtils from "../storage";
import { getGitService } from "../../adapters";
import { getParameterByName } from "../api";

/**
 * The AuthStore manages everything with auth and environment (menu app vs hosted)
 */
class AuthStore {
  getToken() {
    const { token } = Store.getState().storage;
    return token;
  }

  hasValidToken() {
    const token = this.getToken();
    return token && AuthUtils.isTokenValid(token);
  }

  getDecodedToken() {
    const token = this.getToken();
    return token ? AuthUtils.decodeJWT(token) : {};
  }

  getGithubUsername() {
    const decoded = this.getDecodedToken();
    return decoded.github_username;
  }

  getBitbucketUsername() {
    const decoded = this.getDecodedToken();
    return decoded.bitbucket_username;
  }

  hasServiceUsername() {
    switch (getGitService()) {
      case "github":
        return this.getGithubUsername() ? true : false;
      case "bitbucket":
        return this.getBitbucketUsername() ? true : false;
      default:
        return false;
    }
  }

  /**
   * Returns one of 'no_token', 'has_token', 'has_authenticated'
   */
  getAuthState() {
    if (!this.hasValidToken()) {
      return "no_token";
    } else if (this.hasServiceUsername()) {
      return "has_authenticated";
    } else {
      return "has_token";
    }
  }

  /**
   * Returns true if token or environment changed
   */
  hasChanged(prevStorage, newStorage) {
    let hasTokenChanged = prevStorage.token !== newStorage.token;
    return hasTokenChanged;
  }

  /**
   * Returns a promise after setting up authorization
   */
  setup() {
    const {
      clientId: storedId,
      token: existingToken
    } = Store.getState().storage;
    let clientId = storedId || AuthUtils.generateClientId();
    return new Promise((resolve, reject) => {
      AuthUtils.handleTokenState(clientId, existingToken).then(token => {
        StorageUtils.setInSyncStore({ token, clientId }, () => {});
        const decoded = AuthUtils.decodeJWT(token);
        resolve(decoded);
      });
    });
  }

  /**
   * Returns a promise after OAuth flow
   */
  launchOAuthFlow = () => {
    const { token } = Store.getState().storage;
    const baseUrl = this.getBaseUrl();
    return new Promise((resolve, reject) => {
      AuthUtils.triggerOAuthFlow(baseUrl, token, response => {
        if (response === null) {
          console.log("Could not login with github.");
          reject();
        } else {
          const refreshedToken = getParameterByName("token", response);
          StorageUtils.setInSyncStore({ token: refreshedToken });
          resolve();
        }
      });
    });
  };

  /**
   * Returns a promise after logging out
   */
  launchLogoutFlow = () => {
    const { token } = Store.getState().storage;
    const baseUrl = this.getBaseUrl();
    return new Promise((resolve, reject) => {
      AuthUtils.triggerLogoutFlow(baseUrl, token, response => {
        if (response === null) {
          console.log("Could not log out.");
          reject();
        } else {
          const refreshedToken = getParameterByName("token", response);
          StorageUtils.setInSyncStore({ token: refreshedToken });
          resolve();
        }
      });
    });
  };

  getBaseUrl = () => {
    let envRootUrl = "https://www.codeview.io/";

    if (process.env.REACT_APP_BACKEND_ENV === "local") {
      envRootUrl = "http://localhost:8000/";
    }

    return envRootUrl;
  };
}

export default new AuthStore();
