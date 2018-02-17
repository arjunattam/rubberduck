import React from "react";
import { connect } from "react-redux";
import "./Title.css";

class Title extends React.Component {
  render() {
    let repoDetails = this.props.data.repoDetails;

    return (
      <div className="header">
        <p>
          <a href={"/" + repoDetails.username}>{repoDetails.username}</a> /{" "}
          <a href={"/" + repoDetails.username + "/" + repoDetails.reponame}>
            {repoDetails.reponame}
          </a>
        </p>
        <p className="branch">{this.props.branch}</p>
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
