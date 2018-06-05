import React from "react";
import { bindActionCreators } from "redux";
import { getGitService } from "../../../adapters";
import * as DataActions from "../../../actions/dataActions";
import * as StorageUtils from "../../../utils/storage";
import Authorization from "../../../utils/authorization";
import SettingsInternal from "./SettingsComponent";

export class Settings extends React.Component {
  constructor(props) {
    super(props);
    this.DataActions = bindActionCreators(DataActions, this.props.dispatch);
  }

  launchOAuthFlow = () => {
    // this.setLoadingState();
    Authorization.launchOAuthFlow()
      .then(response => this.stopLoading())
      .catch(error => this.stopLoading());
  };

  launchLogoutFlow = () => {
    // this.setLoadingState();
    Authorization.launchLogoutFlow()
      .then(response => this.stopLoading())
      .catch(error => this.stopLoading());
  };

  getServiceUsername = () => {
    const service = getGitService();

    if (service === "github") {
      return Authorization.getGithubUsername();
    } else if (service === "bitbucket") {
      return Authorization.getBitbucketUsername();
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
    switch (Authorization.getAuthState()) {
      case "has_authenticated":
        return <span>{`Logged in ${this.getServiceUsername()}`}</span>;
      case "has_token":
        return (
          <a className="pointer" onClick={() => this.launchOAuthFlow()}>
            {this.getLoginPrompt()}
          </a>
        );
      case "no_token":
      default:
        return <span>No token found</span>;
    }
  };

  onPortChange = event =>
    StorageUtils.setInLocalStore({ defaultPort: event.target.value });

  /**
   * Whenever our hasMenuApp setting changes, we want to clear the
   * menu app tokens, because our menu app server instance might have changed.
   * Right after this, auth store will issue new tokens and update the store.
   *
   * At this point, we also check whether chrome permissions to communicate
   * with the menu app server. This requires "user interaction" and therefore
   * needs to be done here.
   */
  onMenuChange = event => {
    if (this.props.data.data.isUnauthenticated) {
      this.DataActions.updateData({ isUnauthenticated: false });
    }
    const { checked: hasMenuApp } = event.target;
    const values = {
      hasMenuApp,
      menuAppTokens: {}
    };
    if (hasMenuApp) {
      Authorization.updateChromePermissions().then(response => {
        StorageUtils.setInLocalStore(values);
      });
    } else {
      StorageUtils.setInLocalStore(values);
    }
  };

  render() {
    const { hasMenuApp, defaultPort } = this.props.storage;
    return (
      <SettingsInternal
        isVisible={this.props.isVisible}
        authState={this.getAuthState()}
        onLogout={() => this.launchLogoutFlow()}
        hasMenuApp={hasMenuApp}
        defaultPort={defaultPort}
        onPortChange={this.onPortChange}
        onMenuChange={this.onMenuChange}
      />
    );
  }
}
