import React from "react";
import Octicon from "react-component-octicons";
import { constructPath } from "../../adapters/github/path";
import "./Tree.css";

export const TreeLabel = props => {
  const additions = props.additions ? (
    <span className="tree-additions">{props.additions}</span>
  ) : null;
  const deletions = props.deletions ? (
    <span className="tree-deletions">{props.deletions}</span>
  ) : null;

  return (
    <span>
      <Octicon
        name={props.icon}
        style={{ height: 15, color: props.iconColor }}
      />{" "}
      {props.name} {additions} {deletions}
    </span>
  );
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

    if (this.props.additions !== undefined) {
      return (
        <div className="file-container">
          <a onClick={() => this.scrollTo()} style={{ paddingLeft: pl }}>
            <TreeLabel {...this.props} icon="file" iconColor="#999" />
          </a>
        </div>
      );
    } else {
      const path = constructPath(
        this.props.path,
        this.props.data.repoDetails.username,
        this.props.data.repoDetails.reponame,
        this.props.data.repoDetails.branch
      );

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
