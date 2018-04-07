import React from "react";
import FileIcon from "./fileIcon/FileIcon";

const renderStatus = status => {
  switch (status) {
    case "renamed":
      return <span className="tree-status">renamed</span>;
      break;
    case "added":
      return <span className="tree-status">new</span>;
      break;
    default:
      return null;
  }
};

const TreeLabel = props => {
  const additions = props.additions ? (
    <span className="tree-additions">{props.additions}</span>
  ) : null;
  const deletions = props.deletions ? (
    <span className="tree-deletions">{props.deletions}</span>
  ) : null;
  const status = renderStatus(props.status);

  let labelStyle = {
    paddingTop: "4px",
    paddingBottom: "4px",
    marginRight: "4px"
  };

  return (
    <span>
      <FileIcon
        fileName={props.name}
        octicon={props.icon}
        octColor={props.iconColor}
      />
      <span style={labelStyle}>{props.name}</span>
      {additions} {deletions} {status}
    </span>
  );
};

export default TreeLabel;
