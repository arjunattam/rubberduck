import React from "react";
import Octicon from "react-component-octicons";
import FileIcon from "./fileIcon/FileIcon";

const renderStatus = text =>
  text ? <span className="tree-status">{text}</span> : null;

const TreeLabelInner = props => {
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

const LabelTriangle = props => (
  <Octicon name={"triangle-down"} className="file-triangle" />
);

const getClassName = isSelected =>
  `file-container ${isSelected ? "file-selected" : ""}`;

const TreeLabel = props => (
  <div className={getClassName(props.isSelected)}>
    <a
      href={props.href}
      onClick={props.onClick}
      style={{ paddingLeft: props.paddingLeft }}
    >
      {props.hasTriangle ? <LabelTriangle /> : null}
      <TreeLabelInner {...props} />
    </a>
  </div>
);

export default TreeLabel;
