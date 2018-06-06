import _ from "lodash";
import ReduxStore from "../../store";
import { bindActionCreators } from "redux";
import * as DataActions from "../../actions/dataActions";
import * as AuthUtils from "./utils";
import * as StorageUtils from "../storage";
import * as CrashReporting from "../crashes";
import * as AnalyticsUtils from "../analytics";
import { getGitService } from "../../adapters";
import { getParameterByName } from "../api";
import { WS } from "../websocket";

/**
 * The AuthStore manages auth and environment (menu app vs hosted)
 */
export class AuthStore {
  /**
   * Constructing with the store so that we can inject during testing
   */
  constructor(store) {
    this.store = store;
    this.isOnMenuAppEnv = null;
    this.DataActions = bindActionCreators(DataActions, store.dispatch);
    this.store.subscribe(() => this.updateEnvironment());
  }

  updateEnvironment() {
    const hasInit = this.store.getState().storage.initialized;
    const newMenuApp = this.store.getState().storage.hasMenuApp;

    if (hasInit && newMenuApp !== this.isOnMenuAppEnv) {
      this.isOnMenuAppEnv = newMenuApp;
      if (newMenuApp) {
        WS.tearDown().then(() => this.setup());
      }
    }
  }

  getToken() {
    return this.getTokenFromStorage(this.store.getState().storage);
  }

  getClientId() {
    return this.getClientIdFromStorage(this.store.getState().storage);
  }

  getBaseUrl = () => {
    let envRootUrl = "https://www.codeview.io/";

    if (process.env.REACT_APP_BACKEND_ENV === "local") {
      envRootUrl = "http://localhost:8000/";
    }

    if (this.isOnMenuAppEnv) {
      const { defaultPort } = this.store.getState().storage;
      envRootUrl = `http://localhost:${defaultPort}/`;
    }

    return envRootUrl;
  };

  getTokenFromStorage = storage => {
    let container = storage;

    if (this.isOnMenuAppEnv) {
      container = storage.menuAppTokens;
    }

    const { token } = container;
    return token;
  };

  getClientIdFromStorage = storage => {
    let container = storage;

    if (this.isOnMenuAppEnv) {
      container = storage.menuAppTokens;
    }

    const { clientId } = container;
    return clientId;
  };

  updateTokenStorage = ({ token, clientId }) => {
    const nonNull = _.pickBy({ token, clientId }, _.identity);

    if (this.isOnMenuAppEnv) {
      StorageUtils.setInLocalStore({ menuAppTokens: nonNull }, () => {});
    } else {
      StorageUtils.setInSyncStore(nonNull, () => {});
    }
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
    return decoded.github_username || "";
  }

  getBitbucketUsername() {
    const decoded = this.getDecodedToken();
    return decoded.bitbucket_username || "";
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
    const prevToken = this.getTokenFromStorage(prevStorage);
    const newToken = this.getTokenFromStorage(newStorage);
    const hasTokenChanged = prevToken !== newToken;
    const hasEnvChanged = prevStorage.hasMenuApp !== newStorage.hasMenuApp;
    return hasEnvChanged || hasTokenChanged;
  }

  /**
   * Returns a promise after setting up authorization
   */
  setup() {
    const storedId = this.getClientId();
    const existingToken = this.getToken();
    let clientId = storedId || AuthUtils.generateClientId();
    return new Promise((resolve, reject) => {
      AuthUtils.handleTokenState(clientId, existingToken)
        .then(token => {
          this.updateTokenStorage({ token, clientId });
          const decoded = AuthUtils.decodeJWT(token);
          resolve(decoded);
        })
        .catch(error => {
          // This probably means that the server is down,
          // and so we set status to "disconnected".
          this.DataActions.updateSessionStatus({ status: "disconnected" });
          CrashReporting.catchException(error);
        });
    }).then(decodedInfo => {
      const userInfo = {
        ...decodedInfo,
        isOnMenuAppEnv: this.isOnMenuAppEnv
      };
      CrashReporting.setupUser(userInfo);
      AnalyticsUtils.setupUser(userInfo);
      return userInfo;
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
          this.updateTokenStorage({ token: refreshedToken });
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
          this.updateTokenStorage({ token: refreshedToken });
          resolve();
        }
      });
    });
  };

  updateChromePermissions = () => {
    const url = "http://localhost/*"; // ports don't matter
    return AuthUtils.updateChromePermissions(url);
  };
}

export default new AuthStore(ReduxStore);
