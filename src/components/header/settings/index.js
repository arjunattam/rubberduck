import React from "react";
import { bindActionCreators } from "redux";
import * as DataActions from "../../../actions/dataActions";
import * as StorageUtils from "../../../utils/storage";
import Authorization from "../../../utils/authorization";
import { getGitService } from "../../../adapters";
import SettingsInternal from "./Settings";

export default class Settings extends React.Component {
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

  getAuthState = () => Authorization.getAuthState();

  onPortChange = newValue =>
    StorageUtils.setInLocalStore({ defaultPort: newValue });

  /**
   * Whenever our hasMenuApp setting changes, we want to clear the
   * menu app tokens, because our menu app server instance might have changed.
   * Right after this, auth store will issue new tokens and update the store.
   *
   * At this point, we also check whether chrome permissions to communicate
   * with the menu app server. This requires "user interaction" and therefore
   * needs to be done here.
   */
  onMenuChange = newMenuApp => {
    // if (this.props.data.data.isUnauthenticated) {
    //   this.DataActions.updateData({ isUnauthenticated: false });
    // }
    const values = {
      hasMenuApp: newMenuApp,
      menuAppTokens: {}
    };
    if (newMenuApp) {
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
        serviceUsername={this.getServiceUsername()}
        onLogout={this.launchLogoutFlow}
        onLogin={this.launchOAuthFlow}
        hasMenuApp={hasMenuApp}
        defaultPort={defaultPort}
        onPortChange={this.onPortChange}
        onMenuChange={this.onMenuChange}
      />
    );
  }
}
