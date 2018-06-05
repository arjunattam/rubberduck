import React from "react";
import PropTypes from "prop-types";
import { NewTabLink } from "./common";
import { getGitService } from "../../../../adapters";

export default class CloudSettings extends React.Component {
  static propTypes = {
    onLogin: PropTypes.func.isRequired,
    onLogout: PropTypes.func.isRequired,
    authState: PropTypes.string.isRequired,
    serviceUsername: PropTypes.string.isRequired
  };

  getLoginPrompt = () => {
    const service = getGitService();
    const { onLogin } = this.props;
    let text = "";

    if (service === "github") {
      text = "Login with GitHub";
    } else if (service === "bitbucket") {
      text = "Login with Bitbucket";
    }

    return (
      <a className="pointer" onClick={onLogin}>
        {text}
      </a>
    );
  };

  getLoggedInMessage = () => {
    return <span>{`Logged in: ${this.props.serviceUsername}`}</span>;
  };

  getAuth = () => {
    const { authState } = this.props;
    switch (authState) {
      case "has_authenticated":
        return this.getLoggedInMessage();
      case "has_token":
        return this.getLoginPrompt();
      case "no_token":
      default:
        return <span>No token found</span>;
    }
  };

  isLoggedIn = () => {
    return this.props.authState === "has_authenticated";
  };

  render() {
    const { onLogout } = this.props;
    return (
      <ul className="settings-sub-list">
        <li>
          <NewTabLink
            link="https://support.rubberduck.io/articles/26923"
            label="Using on private repos"
          />
        </li>
        <li>{this.getAuth()}</li>
        {this.isLoggedIn() ? (
          <li>
            <a className="pointer" onClick={onLogout}>
              Logout
            </a>
          </li>
        ) : null}
      </ul>
    );
  }
}
