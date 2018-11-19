import React from "react";
import CloudSettings from "./cloud";

const EnvironmentSettings = props => {
  return (
    <div className="settings-sub-section">
      <CloudSettings
        onLogin={props.onLogin}
        onLogout={props.onLogout}
        isAuthLoading={props.isAuthLoading}
        authState={props.authState}
        serviceUsername={props.serviceUsername}
      />
    </div>
  );
};

export default EnvironmentSettings;
