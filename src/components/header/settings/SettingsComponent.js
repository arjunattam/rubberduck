import React from "react";
import EnvironmentSettings from "./environment";
import SupportSection from "./support";
import "./Settings.css";

const getClassName = ({ isVisible }) => {
  const nameModifier = isVisible ? "" : "settings-section-hidden";
  return `${nameModifier} settings-section`;
};

const SettingsInternal = props => (
  <div className={getClassName(props)}>
    <EnvironmentSettings {...props} />
    <SupportSection />
  </div>
);

export default SettingsInternal;
