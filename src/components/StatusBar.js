import React from "react";
import { connect } from "react-redux";
import { bindActionCreators } from "redux";
import * as AuthActions from "../actions/authActions";
import "./StatusBar.css";
import { getParameterByName } from "./../utils/api";
import { addChromeListener } from "./../utils/chrome";
import { Authorization } from "./../utils/authorization";
import * as Session from "./../utils/session";
import * as GitPathAdapter from "../adapters/github/path";
class StatusBar extends React.Component {
  // TODO(arjun): update the login url and response handling
  constructor(props) {
    super(props);
    this.state = {};
    this.AuthActions = bindActionCreators(AuthActions, this.props.dispatch);
  }

  componentDidMount() {
    // See docs/AUTHENTICATION.md for flow
    // 1. Get client id from the storage. If not found, then set it up
    // 2. Get the jwt from the storage. If not found, then make API call to get it
    // 3. Manage refresh for the jwt
    // 4. On login with github, trigger oauth flow, and get new jwt
    Authorization.initialize(this.props.dispatch);
    this.setupChromeListener();
  }

  componentWillReceiveProps(nextProps) {
    if (!this.props.auth.jwt && nextProps.auth.jwt) {
      this.updateSession();
    }
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

  setupChromeListener = () => {
    // Setup the chrome message passing listener for
    // messages from the background.
    addChromeListener(action => {
      if (action === "URL_UPDATE") {
        this.updateSession();
      }
    });
  };

  updateSession() {
    let urlDetail = GitPathAdapter.getRepoFromPath();
    let pageType = urlDetail.type;
    let organization = urlDetail.username;
    let repoName = urlDetail.reponame;
    let pullRequestId = urlDetail.typeId;
    if (pageType === "pull" && organization && repoName && pullRequestId) {
      let pr = `${organization}/${repoName}/${pullRequestId}`;
      if (!this.props.auth.session[pr]) {
        this.AuthActions.updateSession({
          pullRequestId,
          organization,
          repoName
        });
      }
    }
  }

  render() {
    // Three possible situations: token unavailable, token available but no github login
    // and token and github login
    const decodedJWT = this.props.auth.jwt
      ? Authorization.decodeJWT(this.props.auth.jwt)
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
