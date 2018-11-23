import ReduxStore from "../../store";
import * as Utils from "./utils";
import * as StorageUtils from "../storage";
import { getGitService } from "../../adapters";
import { getParameterByName } from "../api";

export class AuthStore {
  constructor(private store) {}

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

    return envRootUrl;
  };

  getTokenFromStorage = storage => {
    let container = storage;
    const { token } = container;
    return token;
  };

  getClientIdFromStorage = storage => {
    let container = storage;
    const { clientId } = container;
    return clientId;
  };

  updateTokenStorage = ({ token, clientId }) => {
    StorageUtils.setInSyncStore({ token, clientId }, () => {});
  };

  hasValidToken() {
    const token = this.getToken();
    return token && Utils.isTokenValid(token);
  }

  getDecodedToken() {
    const token = this.getToken();
    return token ? Utils.decodeJWT(token) : {};
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
    return hasTokenChanged;
  }

  /**
   * Returns a promise after setting up authorization
   */
  // setup() {
  //   const storedId = this.getClientId();
  //   const existingToken = this.getToken();
  //   let clientId = storedId || AuthUtils.generateClientId();

  //   return new Promise((resolve, reject) => {
  //     AuthUtils.handleTokenState(clientId, existingToken)
  //       .then(token => {
  //         this.updateTokenStorage({ token, clientId });
  //         const decoded = AuthUtils.decodeJWT(token);
  //         resolve(decoded);
  //       })
  //       .catch(error => {
  //         // This probably means that the server is down,
  //         // and so we set status to "disconnected".
  //         this.DataActions.updateSessionStatus({ status: "disconnected" });
  //         CrashReporting.catchException(error);
  //       });
  //   }).then(userInfo => {
  //     CrashReporting.setupUser(userInfo);
  //     AnalyticsUtils.setupUser(userInfo);
  //     return userInfo;
  //   });
  // }

  /**
   * Returns a promise after OAuth flow
   */
  // launchOAuthFlow = () => {
  //   const token = this.getToken();
  //   const baseUrl = this.getBaseUrl();
  //   return new Promise((resolve, reject) => {
  //     Utils.triggerOAuthFlow(baseUrl, token, response => {
  //       if (response === null) {
  //         console.log("Could not login with github.");
  //         reject();
  //       } else {
  //         const refreshedToken = getParameterByName("token", response);
  //         this.updateTokenStorage({ token: refreshedToken });
  //         resolve();
  //       }
  //     });
  //   });
  // };

  /**
   * Returns a promise after logging out
   */
  // launchLogoutFlow = () => {
  //   const token = this.getToken();
  //   const baseUrl = this.getBaseUrl();

  //   return new Promise((resolve, reject) => {
  //     Utils.triggerLogoutFlow(baseUrl, token, response => {
  //       if (response === null) {
  //         console.log("Could not log out.");
  //         reject();
  //       } else {
  //         const refreshedToken = getParameterByName("token", response);
  //         this.updateTokenStorage({ token: refreshedToken });
  //         resolve();
  //       }
  //     });
  //   });
  // };
}

export const AuthUtils = new AuthStore(ReduxStore);
