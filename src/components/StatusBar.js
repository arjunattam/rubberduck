import React from "react";
import "./StatusBar.css";
import { API, getParameterByName } from "./../utils/api";
import { setInStore, getFromStore } from "./../utils/storage";
import { getRandomToken, triggerOAuthFlow, decodeJWT } from "./../utils/auth";

export default class StatusBar extends React.Component {
  // TODO(arjun): update the login url and response handling
  state = {
    token: null
  };

  getClientId = () => {
    // This methods attempts to get the client_id from chrome.storage
    const key = "client_id";
    return new Promise((resolve, reject) => {
      getFromStore(key, value => {
        if (value === null) {
          // This means we need to create a value and store it.
          const clientId = getRandomToken();
          setInStore(key, clientId, () => {
            resolve(clientId);
          });
        } else {
          // Value exists, we can just resolve it
          resolve(value);
        }
      });
    });
  };

  getJWT = clientId => {
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
  };

  receivedToken = token => {
    // When token has been received, we will save to storage
    const decoded = decodeJWT(token);
    const key = "token";
    setInStore(key, token, () => {
      this.setState({ token: token });
    });
  };

  refreshToken = (existingToken, callback) => {
    // Use the existing jwt to get a refreshed token, with
    // an extended expiry. To be safe, this is triggered on every component
    // load for now. The jwt expiry is set at 3 days in the backend.
    API.refreshTokenBackground(existingToken, response => {
      const token = response.token;
      callback(token);
    });
    // TODO(arjun): this will raise an error if the refresh fails,
    // in which case we will have to re-issue the token flow.
  };

  componentDidMount() {
    // See docs/AUTHENTICATION.md for flow
    // 1. Get client id from the storage. If not found, then set it up
    // 2. Get the jwt from the storage. If not found, then make API call to get it
    // 3. Manage refresh for the jwt
    // 4. On login with github, trigger oauth flow, and get new jwt
    this.getClientId()
      .then(this.getJWT)
      .then(this.receivedToken);
  }

  launchOAuthFlow = () => {
    // If token already exists we probably need to do any of this
    triggerOAuthFlow(this.state.token, response => {
      // response is the redirected url. It is possible that it is null,
      // when the background page throws an error. In that case we should
      // refresh the JWT, and not store this value in the store.
      if (response === null) {
        // Unsuccessful flow
        // TODO(arjun): how will github auth get retriggerd when response is null?
        console.log("Could not login with github.");
      } else {
        // Successful OAuth flow, save refreshed token
        const refreshedToken = getParameterByName("token", response);
        setInStore("token", refreshedToken, () => {
          this.receivedToken(refreshedToken);
        });
      }
    });
  };

  render() {
    // Three possible situations: token unavailable, token available but no github login
    // and token and github login
    const decodedJWT = this.state.token ? decodeJWT(this.state.token) : {};
    const githubUser = decodedJWT.github_username;
    const hasToken = this.state.token !== null;
    const hasBoth = githubUser !== undefined && githubUser !== "";

    if (hasBoth) {
      return (
        <div className="status">
          <p> Logged in as {githubUser}</p>
          <p>
            <a href="#" onClick={this.launchOAuthFlow}>
              Reauthenticate
            </a>
          </p>
        </div>
      );
    } else if (hasToken) {
      return (
        <div className="status">
          <p>
            <a href="#" onClick={this.launchOAuthFlow}>
              Login with Github
            </a>
          </p>
        </div>
      );
    } else {
      return (
        <div className="status">
          <p>No token found</p>
        </div>
      );
    }
  }
}
