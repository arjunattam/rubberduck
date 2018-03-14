import React from "react";
import Octicon from "react-component-octicons";
import "./Section.css";

const SectionHeaderIcon = props => {
  const iconStyle = { height: 12, marginRight: "5px", width: 12 };
  let traingleCLassName = props.isOpen
    ? "section-triangle"
    : "section-triangle collapsed";
  return (
    <Octicon
      name="triangle-down"
      className={traingleCLassName}
      style={iconStyle}
    />
  );
};

const SectionHeader = props => (
  <div className="section-header" onClick={props.onClick}>
    <SectionHeaderIcon isOpen={props.isVisible} />
    {props.name}
  </div>
);

export default SectionHeader;
