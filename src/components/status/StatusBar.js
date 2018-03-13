import React from "react";
import { connect } from "react-redux";
import "./StatusBar.css";
import { getParameterByName } from "../../utils/api";
import { Authorization } from "../../utils/authorization";
import * as StorageUtils from "../../utils/storage";
import SessionStatus from "./SessionStatus";
import AuthPrompt from "./auth";

const chatBadge = (
  <a href="https://gitter.im/rubberduckio/Lobby" target="_blank">
    <img src="https://badges.gitter.im/gitterHQ/gitter.png" />
  </a>
);

class StatusBar extends React.Component {
  state = {
    isExpanded: false
  };

  launchOAuthFlow = () => {
    // If token already exists we probably need to do any of this
    let token = this.props.storage.token;
    Authorization.triggerOAuthFlow(token, response => {
      // response is the redirected url. It is possible that it is null,
      // when the background page throws an error. In that case we should
      // refresh the JWT, and not store this value in the store.
      if (response === null) {
        // Unsuccessful flow
        console.log("Could not login with github.");
      } else {
        // Successful OAuth flow, save refreshed token
        const refreshedToken = getParameterByName("token", response);
        StorageUtils.setAllInStore({ token: refreshedToken });
      }
    });
  };

  launchLogoutFlow = () => {
    // We can unlink github profile with this user with the logout flow
    let token = this.props.storage.token;
    Authorization.triggerLogoutFlow(token, response => {
      if (response === null) {
        console.log("Could not log out.");
      } else {
        const refreshedToken = getParameterByName("token", response);
        StorageUtils.setAllInStore({ token: refreshedToken });
      }
    });
  };

  toggleExpand = () => {
    this.setState({
      isExpanded: !this.state.isExpanded
    });
  };

  componentWillReceiveProps(newProps) {
    if (newProps.data.isUnauthenticated) {
      this.setState({
        isExpanded: true
      });
    }
  }

  render() {
    return (
      <div>
        {/* <SessionStatus /> */}
        <AuthPrompt isExpanded={this.state.isExpanded} />
        {this.renderAuth()}
      </div>
    );
  }

  renderAuth() {
    // Three possible situations: 1. token unavailable, 2. token available but
    // no github login, and 3. token and github login both available
    const decodedJWT = this.props.storage.token
      ? Authorization.decodeJWT(this.props.storage.token)
      : {};
    const githubUser = decodedJWT.github_username;
    const hasToken = this.props.storage.token !== null;
    const hasBoth = githubUser !== undefined && githubUser !== "";

    let authState = <p>No token found</p>;

    if (hasBoth) {
      authState = <p> Logged in as {githubUser}</p>;
    } else if (hasToken) {
      authState = (
        <p>
          <a href="javascript:" onClick={() => this.launchOAuthFlow()}>
            Login with Github
          </a>
        </p>
      );
    }
    return (
      <div className="status">
        <div>{authState}</div>
        <div
          className="status-expand-button"
          onClick={() => this.toggleExpand()}
        >
          See more
        </div>
      </div>
    );
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
