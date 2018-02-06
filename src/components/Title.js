import React from "react";
import "./Title.css";

export default class Title extends React.Component {
  render() {
    return (
      <div className="header">
        <p>
          <a href={"/" + this.props.username}>{this.props.username}</a> /{" "}
          <a href={"/" + this.props.username + "/" + this.props.reponame}>
            {this.props.reponame}
          </a>
        </p>
        <p style={{ fontSize: "10px" }}>master</p>
        <div>{this.props.children}</div>
      </div>
    );
  }
}
