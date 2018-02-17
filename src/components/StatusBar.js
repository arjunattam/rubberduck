import React from "react";
import { connect } from "react-redux";
import "./StatusBar.css";
import { getParameterByName } from "./../utils/api";
import { Authorization } from "./../utils/authorization";
import * as StorageUtils from "./../utils/storage";

class StatusBar extends React.Component {
  // TODO(arjun): update the login url and response handling
  constructor(props) {
    super(props);
    this.state = {};
  }

  launchOAuthFlow = () => {
    // If token already exists we probably need to do any of this
    let token = this.props.storage.token;
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
        StorageUtils.setAllInStore({ token: refreshedToken });
      }
    });
  };

  render() {
    // Three possible situations: token unavailable, token available but no github login
    // and token and github login
    const decodedJWT = this.props.storage.token
      ? Authorization.decodeJWT(this.props.storage.token)
      : {};
    const githubUser = decodedJWT.github_username;
    const hasToken = this.props.storage.token !== null;
    const hasBoth = githubUser !== undefined && githubUser !== "";

    if (hasBoth) {
      return (
        <div className="status">
          <p> Logged in as {githubUser}</p>
          <p>
            <a href="#" onClick={() => this.launchOAuthFlow()}>
              Reauthenticate
            </a>
          </p>
        </div>
      );
    } else if (hasToken) {
      return (
        <div className="status">
          <p>
            <a href="#" onClick={() => this.launchOAuthFlow()}>
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
  const { data, storage } = state;
  return {
    data,
    storage
  };
}
export default connect(mapStateToProps)(StatusBar);
