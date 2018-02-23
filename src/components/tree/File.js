import React from "react";
import Octicon from "react-component-octicons";
import { constructPath } from "../../adapters/github/path";
import "./Tree.css";

export default class File extends React.Component {
  getPadding = () => {
    // padding is a function of depth
    return (this.props.depth + 1) * 12 + 2;
  };

  render() {
    const pl = this.getPadding();
    const path = constructPath(
      this.props.path,
      this.props.data.repoDetails.username,
      this.props.data.repoDetails.reponame,
      this.props.data.repoDetails.branch
    );
    return (
      <div className="file-container">
        <a href={path} style={{ paddingLeft: pl }}>
          <Octicon name="file" style={{ height: 15, color: "#999" }} />{" "}
          {this.props.name}
        </a>
      </div>
    );
  }
}
