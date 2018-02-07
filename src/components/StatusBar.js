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

  getClientId = callback => {
    // This methods attempts to get the client_id from storage
    const key = "client_id";
    getFromStore(key, value => {
      if (value === null) {
        // This means we need to create a value and store it.
        const clientId = getRandomToken();
        setInStore(key, clientId, () => {
          callback(clientId);
        });
        // TODO(arjun): convert to promises
      } else {
        callback(value);
      }
    });
  };

  receivedToken = token => {
    //
  };

  getJWT = (clientId, callback) => {
    // This methods attempts to get the token from storage,
    // if not found, makes an API call
    const key = "token";
    // TODO(arjun): convert to promises
    getFromStore(key, value => {
      // null means we need to make API call to server and fetch jwt
      if (value === null) {
        // Cannot use axios http call because domain is not https
        /* issueToken(clientId) */
        issueTokenBackground(clientId, response => {
          const token = response.token;
          setInStore(key, token, () => {
            callback(token);
          });
        });
      } else {
        callback(value);
      }
    });
  };

  componentDidMount() {
    // See docs/AUTHENTICATION.md for flow
    // 1. Get client id from the storage --> if not, then ask background to set that up
    this.getClientId(
      // 2. Get the jwt from the storage --> if not, then make API call to get it
      clientId => {
        this.getJWT(clientId, token => {
          parseJWT(token);
          this.setState({ token: token });
        });
      }
    );
    // 3. Manage refresh for the jwt - TODO(arjun)
    // 4. On login with github, trigger oauth flow --> get redirected url with new jwt
  }

  launchOAuthFlow = () => {
    // If token already exists we probably need to do any of this
    triggerOAuthFlow(this.state.token, response => {
      // response is a url of
      const refreshedToken = getParameterByName("token", response);
      setInStore("token", refreshedToken, () => {
        parseJWT(refreshedToken);
        this.setState({ token: refreshedToken });
      });
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
