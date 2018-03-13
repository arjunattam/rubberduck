import React from "react";
import { connect } from "react-redux";
import "./StatusBar.css";
import { getParameterByName } from "../../utils/api";
import { Authorization } from "../../utils/authorization";
import * as StorageUtils from "../../utils/storage";
import SessionStatus from "./SessionStatus";
import AuthPrompt from "./auth";
import { SettingsButton, Settings } from "./settings";

const StatusComponent = props => (
  <div>
    <AuthPrompt isExpanded={props.showAuthPrompt} />
    <div
      className="status-container"
      style={props.showSettings ? { height: 376 } : null}
    >
      <div className="status">
        <div className="status-auth">{props.authState}</div>
        <SettingsButton onClick={props.onClick} />
      </div>
      <Settings isVisible={props.showSettings} onLogout={props.onLogout} />
    </div>
  </div>
);

class StatusBar extends React.Component {
  state = {
    showAuthPrompt: false,
    showSettings: false
  };

  setDefaultState = () => {
    this.setState({
      showAuthPrompt: false,
      showSettings: false
    });
  };

  launchOAuthFlow = () => {
    // If token already exists we probably need to do any of this
    this.setDefaultState();
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

  toggleSettings = () => {
    this.setState({
      showSettings: !this.state.showSettings
    });
  };

  getAuthState = () => {
    // Three possible situations: 1. token unavailable, 2. token available but
    // no github login, and 3. token and github login both available
    const decodedJWT = this.props.storage.token
      ? Authorization.decodeJWT(this.props.storage.token)
      : {};
    const githubUser = decodedJWT.github_username;
    const hasToken = this.props.storage.token !== null;
    const hasBoth = githubUser !== undefined && githubUser !== "";

    let authState = "No token found";

    if (hasBoth) {
      authState = "Logged in as " + githubUser;
    } else if (hasToken) {
      authState = (
        <a className="pointer" onClick={() => this.launchOAuthFlow()}>
          Login with GitHub
        </a>
      );
    }

    return authState;
  };

  componentWillReceiveProps(newProps) {
    if (newProps.data.isUnauthenticated) {
      this.setState({
        showAuthPrompt: true
      });
    }
  }

  render() {
    return (
      <StatusComponent
        authState={this.getAuthState()}
        showAuthPrompt={this.state.showAuthPrompt}
        showSettings={this.state.showSettings}
        onClick={() => this.toggleSettings()}
        onLogout={() => this.launchLogoutFlow()}
      />
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
