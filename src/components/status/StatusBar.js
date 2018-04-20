import React from "react";
import { connect } from "react-redux";
import { bindActionCreators } from "redux";
import * as DataActions from "../../actions/dataActions";
import { getGitService } from "../../adapters";
import { getParameterByName } from "../../utils/api";
import { Authorization } from "../../utils/authorization";
import * as StorageUtils from "../../utils/storage";
import AuthPrompt from "./auth";
import { SettingsButton, Settings } from "./settings";
import "./StatusBar.css";

const StatusComponent = props => (
  <div className="status-main-container">
    <AuthPrompt isExpanded={props.showAuthPrompt} />
    <div
      className="status-container"
      style={props.showSettings ? { height: 376 } : null}
    >
      <div className="status">
        {props.isLoading ? (
          <div className="status-loader" />
        ) : (
          <div className="status-auth">{props.authState}</div>
        )}
        <SettingsButton onClick={props.onClick} />
      </div>
      <Settings isVisible={props.showSettings} onLogout={props.onLogout} />
    </div>
  </div>
);

class StatusBar extends React.Component {
  constructor(props) {
    super(props);
    this.DataActions = bindActionCreators(DataActions, this.props.dispatch);
  }

  state = {
    showAuthPrompt: false,
    showSettings: false,
    isLoading: false
  };

  setLoadingState = () => {
    this.setState({
      showAuthPrompt: false,
      showSettings: false,
      isLoading: true
    });
    this.DataActions.updateData({
      isUnauthenticated: false
    });
  };

  launchOAuthFlow = () => {
    // If token already exists we probably need to do any of this
    this.setLoadingState();
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
        this.setState({ isLoading: false });
        const refreshedToken = getParameterByName("token", response);
        StorageUtils.setAllInStore({ token: refreshedToken });
      }
    });
  };

  launchLogoutFlow = () => {
    // We can unlink github profile with this user with the logout flow
    let token = this.props.storage.token;
    this.setLoadingState();

    Authorization.triggerLogoutFlow(token, response => {
      if (response === null) {
        console.log("Could not log out.");
      } else {
        this.setState({ isLoading: false });
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

  getServiceUsername = decodedJWT => {
    const service = getGitService();

    if (service === "github") {
      return decodedJWT.github_username;
    } else if (service === "bitbucket") {
      return decodedJWT.bitbucket_username;
    }
  };

  getLoginPrompt = () => {
    const service = getGitService();

    if (service === "github") {
      return "Login with GitHub";
    } else if (service === "bitbucket") {
      return "Login with Bitbucket";
    }
  };

  getAuthState = () => {
    // Three possible situations: 1. token unavailable, 2. token available but
    // no github login, and 3. token and github login both available
    const decodedJWT = this.props.storage.token
      ? Authorization.decodeJWT(this.props.storage.token)
      : {};

    const serviceUser = this.getServiceUsername(decodedJWT);
    const hasToken = this.props.storage.token !== null;
    const hasBoth = serviceUser !== undefined && serviceUser !== "";

    let authState = "No token found";

    if (hasBoth) {
      authState = "Logged in as " + serviceUser;
    } else if (hasToken) {
      authState = (
        <a className="pointer" onClick={() => this.launchOAuthFlow()}>
          {this.getLoginPrompt()}
        </a>
      );
    }

    return authState;
  };

  componentWillReceiveProps(newProps) {
    if (newProps.data.data.isUnauthenticated !== this.state.showAuthPrompt) {
      this.setState({
        showAuthPrompt: newProps.data.data.isUnauthenticated
      });
    }
  }

  render() {
    return (
      <StatusComponent
        {...this.state}
        authState={this.getAuthState()}
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
