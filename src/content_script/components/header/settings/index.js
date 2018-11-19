import React from "react";
import { bindActionCreators } from "redux";
import * as DataActions from "../../../actions/dataActions";
import * as StorageUtils from "../../../utils/storage";
import Authorization from "../../../utils/authorization";
import { getGitService } from "../../../adapters";
import SettingsInternal from "./Settings";

export default class Settings extends React.Component {
  state = {
    isAuthLoading: false
  };

  constructor(props) {
    super(props);
    this.DataActions = bindActionCreators(DataActions, this.props.dispatch);
  }

  setLoadingState = () => {
    this.setState({ isAuthLoading: true });
  };

  stopLoading = () => {
    this.setState({ isAuthLoading: false });
  };

  launchOAuthFlow = () => {
    this.setLoadingState();
    Authorization.launchOAuthFlow()
      .then(response => this.stopLoading())
      .catch(error => this.stopLoading());
  };

  launchLogoutFlow = () => {
    this.setLoadingState();
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

  render() {
    return (
      <SettingsInternal
        isVisible={this.props.isVisible}
        isAuthLoading={this.state.isAuthLoading}
        authState={this.getAuthState()}
        serviceUsername={this.getServiceUsername()}
        onLogout={this.launchLogoutFlow}
        onLogin={this.launchOAuthFlow}
      />
    );
  }
}
