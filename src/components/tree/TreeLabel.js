import React from "react";
import Octicon from "react-component-octicons";
import FileIcon from "./fileIcon/FileIcon";

const StatusText = props => {
  let text = "";

  if (props.text) {
    if (props.text === "added") {
      text = "new"; // show new files as new
    } else if (props.text === "modified") {
      text = ""; // don't show modified
    } else {
      text = props.text;
    }
  }

  return text ? <span className="tree-status">{text}</span> : null;
};

const LabelTriangle = props => (
  <Octicon name={"triangle-down"} className="file-triangle" />
);

const TreeLabelInner = props => {
  const additions = props.additions ? (
    <span className="tree-additions">{props.additions}</span>
  ) : null;
  const deletions = props.deletions ? (
    <span className="tree-deletions">{props.deletions}</span>
  ) : null;

  let labelStyle = {
    paddingTop: "4px",
    paddingBottom: "4px",
    marginRight: "4px"
  };

  const containerStyle = {
    whiteSpace: "nowrap",
    overflow: "hidden",
    textOverflow: "ellipsis"
  };

  return (
    <div style={containerStyle}>
      {props.hasTriangle ? <LabelTriangle /> : null}
      <FileIcon
        fileName={props.name}
        octicon={props.icon}
        octColor={props.iconColor}
      />
      <span style={labelStyle}>{props.name}</span>
      {additions} {deletions}
    </div>
  );
};

const getClassName = isSelected =>
  `file-container ${isSelected ? "file-selected" : ""}`;

const TreeLabel = props => (
  <div className={getClassName(props.isSelected)}>
    <a
      href={props.href}
      onClick={props.onClick}
      style={{ paddingLeft: props.paddingLeft }}
    >
      <TreeLabelInner {...props} />
      <StatusText text={props.status} />
    </a>
  </div>
);

export default TreeLabel;
