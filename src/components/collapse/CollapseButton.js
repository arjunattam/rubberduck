import React from "react";
import Octicon from "react-component-octicons";
import "./CollapseButton.css";

const CollapseIcon = props => (
  <Octicon
    name={props.isVisible ? "chevron-left" : "chevron-right"}
    style={{ height: 20, width: 20 }}
  />
);

// button width is 34px => 44 when the sidebar is visible
const getCollapseStyle = props =>
  props.isVisible ? { left: props.sidebarWidth - 44 } : { left: 10 };

const CollapseButton = props => (
  <div
    className="collapse-container button-div"
    onClick={props.onClick}
    style={getCollapseStyle(props)}
  >
    <CollapseIcon {...props} />
  </div>
);

export default CollapseButton;
