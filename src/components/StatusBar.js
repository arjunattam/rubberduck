import React from "react";
import "./StatusBar.css";
import {
  encodeQueryData,
  getParameterByName,
  issueToken,
  issueTokenBackground
} from "./../utils/api";
import { setInStore, getFromStore } from "./../utils/storage";
import { getRandomToken, triggerOAuthFlow, parseJWT } from "./../utils/auth";

const jwt = require("jsonwebtoken");

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
          issueTokenBackground(clientId, response => {
            const token = response.token;
            setInStore(key, token, () => {
              resolve(token);
            });
          });
        } else {
          resolve(value);
        }
      });
    });
  };

  receivedToken = token => {
    // When token has been received, we will save to storage
    parseJWT(token);
    this.setState({ token: token });
  };

  componentDidMount() {
    // See docs/AUTHENTICATION.md for flow
    // 1. Get client id from the storage. If not found, then set it up
    // 2. Get the jwt from the storage. If not found, then make API call to get it
    // 3. Manage refresh for the jwt - TODO(arjun)
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
    return (
      <div className="status">
        <p>
          <a href="#" onClick={this.launchOAuthFlow}>
            Login
          </a>{" "}
          {this.state.token ? "JWT found" : "JWT missing"}
        </p>
      </div>
    );
  }
}
