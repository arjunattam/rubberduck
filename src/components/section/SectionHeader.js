import React from "react";
import Octicon from "react-component-octicons";
import "./Section.css";

const iconStyle = { height: 12, marginRight: "5px", width: 12 };

const SectionHeaderIcon = props => {
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

const SectionLoader = props => (
  <div className="section-loader">
    <div className="status-loader" />
  </div>
);

const ReportIssue = props => (
  <div
    className="section-loader section-report"
    onClick={e => {
      window.open(
        "https://github.com/karigari/rubberduck-issues/issues/new/choose",
        "_blank"
      );
      e.stopPropagation();
    }}
  >
    <Octicon name="report" />
  </div>
);

const SectionHeader = props => (
  <div className="section-header" onClick={props.onClick}>
    <SectionHeaderIcon isOpen={props.isVisible} />
    {props.name}
    {props.isLoading ? <SectionLoader /> : null}
    {props.isVisible && !props.isLoading ? <ReportIssue /> : null}
  </div>
);

export default SectionHeader;
