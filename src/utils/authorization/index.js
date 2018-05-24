import Store from "../../store";
import * as AuthUtils from "./utils";
import * as StorageUtils from "../storage";
import { getGitService } from "../../adapters";
import { getParameterByName } from "../api";
import _ from "lodash";

/**
 * The AuthStore manages auth and environment (menu app vs hosted)
 */
export class AuthStore {
  /**
   * Constructing with the store so that we can inject during testing
   */
  constructor(store) {
    this.onMenuAppEnv = null;
    this.store = store;
    this.store.subscribe(() => this.updateEnvironment());
  }

  updateEnvironment() {
    const hasInit = this.store.getState().storage.initialized;
    const newMenuApp = this.store.getState().storage.hasMenuApp;

    if (hasInit && newMenuApp != this.onMenuAppEnv) {
      this.onMenuAppEnv = newMenuApp;
    }
    console.log("on menu app", this.onMenuAppEnv);
  }

  getToken() {
    return this.getTokenFromStorage(this.store.getState().storage);
  }

  getClientId() {
    const { clientId } = this.store.getState().storage;
    return clientId;
  }

  getBaseUrl = () => {
    let envRootUrl = "https://www.codeview.io/";

    if (process.env.REACT_APP_BACKEND_ENV === "local") {
      envRootUrl = "http://localhost:8000/";
    }

    return envRootUrl;
  };

  getTokenFromStorage = storage => {
    const { token } = storage;
    return token;
  };

  updateTokenInStorage = ({ token, clientId }) => {
    // TODO(arjun): cant save in sync if on menu
    const nonNull = _.pickBy({ token, clientId }, _.identity);
    StorageUtils.setInSyncStore(nonNull, () => {});
  };

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
    // TODO(arjun): can also be because the menu app setting has changed
    const prevToken = this.getTokenFromStorage(prevStorage);
    const newToken = this.getTokenFromStorage(newStorage);
    return prevToken !== newToken;
  }

  /**
   * Returns a promise after setting up authorization
   */
  setup() {
    const storedId = this.getClientId();
    const existingToken = this.getToken();
    let clientId = storedId || AuthUtils.generateClientId();
    return new Promise((resolve, reject) => {
      AuthUtils.handleTokenState(clientId, existingToken).then(token => {
        this.updateTokenInStorage({ token, clientId });
        const decoded = AuthUtils.decodeJWT(token);
        resolve(decoded);
      });
    });
  }

  /**
   * Returns a promise after OAuth flow
   */
  launchOAuthFlow = () => {
    const token = this.getToken();
    const baseUrl = this.getBaseUrl();
    return new Promise((resolve, reject) => {
      AuthUtils.triggerOAuthFlow(baseUrl, token, response => {
        if (response === null) {
          console.log("Could not login with github.");
          reject();
        } else {
          const refreshedToken = getParameterByName("token", response);
          this.updateTokenInStorage({ token: refreshedToken });
          resolve();
        }
      });
    });
  };

  /**
   * Returns a promise after logging out
   */
  launchLogoutFlow = () => {
    const token = this.getToken();
    const baseUrl = this.getBaseUrl();
    return new Promise((resolve, reject) => {
      AuthUtils.triggerLogoutFlow(baseUrl, token, response => {
        if (response === null) {
          console.log("Could not log out.");
          reject();
        } else {
          const refreshedToken = getParameterByName("token", response);
          this.updateTokenInStorage({ token: refreshedToken });
          resolve();
        }
      });
    });
  };
}

export default new AuthStore(Store);
