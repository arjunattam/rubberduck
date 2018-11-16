import React from "react";
import Octicon from "react-component-octicons";
import { getBranchInfo } from "./branch";
import "./index.css";

const BranchInfo = ({ repoDetails }) => {
  const { iconName, text } = getBranchInfo(repoDetails);
  return (
    <div className="branch-info-container">
      <Octicon name={iconName} style={{ color: "#666" }} /> {text}
    </div>
  );
};

export default BranchInfo;
