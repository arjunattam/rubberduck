import React from "react";
import SegmentControl from "../segmented";
import MenuAppSettings from "./selfhosted";
import CloudSettings from "./cloud";

const EnvironmentSettings = props => {
  return (
    <div className="settings-sub-section">
      <SegmentControl
        onChange={props.onMenuChange}
        hasMenuApp={props.hasMenuApp}
      />
      {props.hasMenuApp ? (
        <MenuAppSettings
          portNumber={props.defaultPort}
          onPortChange={props.onPortChange}
        />
      ) : (
        <CloudSettings
          onLogin={props.onLogin}
          onLogout={props.onLogout}
          isAuthLoading={props.isAuthLoading}
          authState={props.authState}
          serviceUsername={props.serviceUsername}
        />
      )}
    </div>
  );
};

export default EnvironmentSettings;
