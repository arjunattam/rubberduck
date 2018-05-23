import React from "react";
import { connect } from "react-redux";
import { bindActionCreators } from "redux";
import * as DataActions from "../../actions/dataActions";
import { getGitService } from "../../adapters";
import { getParameterByName } from "../../utils/api";
import { Authorization } from "../../utils/authorization";
import * as StorageUtils from "../../utils/storage";
import StatusComponent from "./StatusComponent";
import "./StatusBar.css";

class StatusBar extends React.Component {
  constructor(props) {
    super(props);
    this.DataActions = bindActionCreators(DataActions, this.props.dispatch);
  }

  state = {
    showAuthPrompt: false,
    showSettings: true,
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
    this.setLoadingState();
    const { token } = this.props.storage;
    Authorization.triggerOAuthFlow(token, response => {
      // response is the redirected url. It is possible that it is null,
      // when the background page throws an error. In that case we should
      // refresh the JWT, and not store this value in the store.
      if (response === null) {
        console.log("Could not login with github.");
      } else {
        this.setState({ isLoading: false });
        const refreshedToken = getParameterByName("token", response);
        StorageUtils.setInSyncStore({ token: refreshedToken });
      }
    });
  };

  launchLogoutFlow = () => {
    let token = this.props.storage.token;
    this.setLoadingState();

    Authorization.triggerLogoutFlow(token, response => {
      if (response === null) {
        console.log("Could not log out.");
      } else {
        this.setState({ isLoading: false });
        const refreshedToken = getParameterByName("token", response);
        StorageUtils.setInSyncStore({ token: refreshedToken });
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
    const { token } = this.props.storage;
    const decodedJWT = token ? Authorization.decodeJWT(token) : {};
    const serviceUser = this.getServiceUsername(decodedJWT);
    const hasToken = token !== null;
    const hasBoth = serviceUser !== undefined && serviceUser !== "";
    let authState = "No token found";

    if (hasBoth) {
      authState = "Logged in " + serviceUser;
    } else if (hasToken) {
      authState = (
        <a className="pointer" onClick={() => this.launchOAuthFlow()}>
          {this.getLoginPrompt()}
        </a>
      );
    }

    return authState;
  };

  onPortChange = event =>
    StorageUtils.setInSyncStore({ defaultPort: event.target.value });

  onMenuChange = event =>
    StorageUtils.setInSyncStore({ hasMenuApp: event.target.checked });

  componentWillReceiveProps(newProps) {
    const { isUnauthenticated } = newProps.data.data;
    if (isUnauthenticated !== this.state.showAuthPrompt) {
      this.setState({
        showAuthPrompt: isUnauthenticated
      });
    }
  }

  render() {
    const { hasMenuApp, defaultPort } = this.props.storage;
    return (
      <StatusComponent
        {...this.state}
        authState={this.getAuthState()}
        onClick={() => this.toggleSettings()}
        onLogout={() => this.launchLogoutFlow()}
        hasMenuApp={hasMenuApp}
        defaultPort={defaultPort}
        onPortChange={this.onPortChange}
        onMenuChange={this.onMenuChange}
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
