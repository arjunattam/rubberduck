import React from "react";
import { connect } from "react-redux";
import Octicon from "react-component-octicons";
import "./Title.css";

class Title extends React.Component {
  render() {
    let repoDetails = this.props.data.repoDetails;
    const usernameHref = "/" + repoDetails.username;
    const reponameHref =
      "/" + repoDetails.username + "/" + repoDetails.reponame;

    return (
      <div className="header">
        <p>
          <Octicon name="repo" style={{ height: 21 }} />{" "}
          <a href={usernameHref}>{repoDetails.username}</a> /{" "}
          <a href={reponameHref}>
            <strong>{repoDetails.reponame}</strong>
          </a>
        </p>
        <p className="branch">
          <Octicon name="git-branch" style={{ height: 12 }} />{" "}
          {this.props.data.repoDetails.branch}
        </p>
        <div>{this.props.children}</div>
      </div>
    );
  }
}

function mapStateToProps(state) {
  const { storage, data } = state;
  return {
    storage,
    data
  };
}
export default connect(mapStateToProps)(Title);
