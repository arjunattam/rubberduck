import React from "react";
import Octicon from "react-component-octicons";
import { constructPath } from "../../adapters/github/path";
import "./Tree.css";
import FileIcon from "./fileIcon/FileIcon";

export const TreeLabel = props => {
  const additions = props.additions ? (
    <span className="tree-additions">{props.additions}</span>
  ) : null;
  const deletions = props.deletions ? (
    <span className="tree-deletions">{props.deletions}</span>
  ) : null;
  let labelStyle = { display: "flex", alignItems: "center" };
  if (props.icon === "file") {
    return (
      <div style={labelStyle}>
        <FileIcon fileName={props.name} />
        <span>{props.name}</span>
        {additions} {deletions}
      </div>
    );
  } else {
    return (
      <span>
        <Octicon
          name={props.icon}
          style={{ height: 15, color: props.iconColor }}
        />
        <span>{props.name}</span>
        {additions} {deletions}
      </span>
    );
  }
};

export class File extends React.Component {
  getPadding = () => {
    // padding is a function of depth
    return (this.props.depth + 1) * 12 + 2;
  };

  scrollTo = () => {
    const fileBox = document.querySelectorAll(
      `div.file-header[data-path="${this.props.path}"]`
    )[0];
    window.scrollTo(0, window.scrollY + fileBox.getBoundingClientRect().y - 75);
  };

  render() {
    const pl = this.getPadding();
    const path = constructPath(
      this.props.path,
      this.props.data.repoDetails.username,
      this.props.data.repoDetails.reponame,
      this.props.data.repoDetails.branch
    );

    if (this.props.additions !== undefined) {
      return (
        <div className="file-container">
          <a onClick={() => this.scrollTo()} style={{ paddingLeft: pl }}>
            <TreeLabel {...this.props} icon="file" iconColor="#999" />
          </a>
        </div>
      );
    } else {
      return (
        <div className="file-container">
          <a href={path} style={{ paddingLeft: pl }}>
            <TreeLabel {...this.props} icon="file" iconColor="#999" />
          </a>
        </div>
      );
    }
  }
}
