import React from "react";
import Octicon from "react-component-octicons";
import "./CollapseButton.css";

const CollapseIcon = props => (
  <Octicon
    name={props.isVisible ? "chevron-left" : "chevron-right"}
    style={{ height: 20, width: 20 }}
  />
);

const getCollapseStyle = ({ isVisible, sidebarWidth }) =>
  isVisible ? { left: sidebarWidth } : { left: 10 };

const getClassName = ({ isVisible }) =>
  `collapse-container button-div ${
    isVisible ? "collapse-container-expanded" : ""
  }`;

const CollapseButton = props => (
  <div
    className={getClassName(props)}
    onClick={props.onClick}
    style={getCollapseStyle(props)}
  >
    <CollapseIcon {...props} />
  </div>
);

export default CollapseButton;
