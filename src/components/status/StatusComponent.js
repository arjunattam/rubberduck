import React from "react";
import AuthPrompt from "./auth";
import { GearButton, Settings } from "./settings";
import "./StatusBar.css";

const SettingsStatus = ({ authState, hasMenuApp, defaultPort }) =>
  hasMenuApp ? (
    <div className="settings-status-text settings-success">{`menu app (${defaultPort})`}</div>
  ) : (
    <div>{authState}</div>
  );

const SettingsPreview = props =>
  props.isLoading ? (
    <div className="status-loader" style={{ width: 15, height: 15 }} />
  ) : (
    <div className="status-auth">
      <SettingsStatus {...props} />
    </div>
  );

const StatusContainer = props => (
  <div
    className="status-container"
    style={props.showSettings ? { height: 376 } : null}
    children={props.children}
  />
);

const StatusComponent = props => (
  <div className="status-main-container">
    <AuthPrompt isExpanded={props.showAuthPrompt} />
    <StatusContainer {...props}>
      <div className="status">
        <SettingsPreview {...props} />
        <GearButton onClick={props.onClick} isVisible={props.showSettings} />
      </div>
      <Settings {...props} isVisible={props.showSettings} />
    </StatusContainer>
  </div>
);

export default StatusComponent;
