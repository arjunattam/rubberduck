import React from "react";
import AuthPrompt from "./auth";
import { GearButton, Settings } from "./settings";
import "./StatusBar.css";

const MenuAppStatus = ({ hasMenuApp, defaultPort }) =>
  hasMenuApp ? (
    <div className="tree-status">{`menu app (${defaultPort})`}</div>
  ) : null;

const StatusContainer = props => (
  <div
    className="status-container"
    style={props.showSettings ? { height: 376 } : null}
    children={props.children}
  />
);

const MiniSettings = props =>
  props.isLoading ? (
    <div className="status-loader" style={{ width: 15, height: 15 }} />
  ) : (
    <div className="status-auth">
      <div>{props.authState}</div>
      <MenuAppStatus {...props} />
    </div>
  );

const StatusComponent = props => (
  <div className="status-main-container">
    <AuthPrompt isExpanded={props.showAuthPrompt} />
    <StatusContainer {...props}>
      <div className="status">
        <MiniSettings {...props} />
        <GearButton onClick={props.onClick} />
      </div>
      <Settings {...props} isVisible={props.showSettings} />
    </StatusContainer>
  </div>
);

export default StatusComponent;
