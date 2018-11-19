import React from "react";
import EnvironmentSettings from "./environment";
import VersionSection from "./version";
import "./Settings.css";

const getClassName = ({ isVisible }) => {
  const nameModifier = isVisible ? "" : "settings-section-hidden";
  return `${nameModifier} settings-section`;
};

const SettingsInternal = props => (
  <div className={getClassName(props)}>
    <EnvironmentSettings {...props} />
    <VersionSection />
  </div>
);

export default SettingsInternal;
