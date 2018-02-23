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
          <TreeLabel {...this.props} icon="file" iconColor="#999" />
        </a>
      </div>
    );
  }
}
