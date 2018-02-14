import React from "react";
import { connect } from "react-redux";
import "./StatusBar.css";
import { API, getParameterByName } from "./../utils/api";
import { setInStore, getFromStore } from "./../utils/storage";
import { getRandomToken, triggerOAuthFlow, decodeJWT } from "./../utils/auth";
import { Authorization } from "./../utils/authorization";
class StatusBar extends React.Component {
  // TODO(arjun): update the login url and response handling
  state = {};

  componentDidMount() {
    // See docs/AUTHENTICATION.md for flow
    // 1. Get client id from the storage. If not found, then set it up
    // 2. Get the jwt from the storage. If not found, then make API call to get it
    // 3. Manage refresh for the jwt
    // 4. On login with github, trigger oauth flow, and get new jwt
    Authorization.initialize(this.props.dispatch);
    // this.getClientId()
    //   .then(this.getJWT)
    //   .then(this.receivedToken);
  }

  launchOAuthFlow = () => {
    // If token already exists we probably need to do any of this
    let token = this.props.auth.jwt;
    Authorization.triggerOAuthFlow(token, response => {
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
        Authorization.updateJWT(refreshedToken);
      }
    });
  };

  render() {
    // Three possible situations: token unavailable, token available but no github login
    // and token and github login
    const decodedJWT = this.props.auth.jwt
      ? decodeJWT(this.props.auth.jwt)
      : {};
    const githubUser = decodedJWT.github_username;
    const hasToken = this.props.auth.jwt !== null;
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

function mapStateToProps(state) {
  const { auth } = state;
  return {
    auth
  };
}
export default connect(mapStateToProps)(StatusBar);
