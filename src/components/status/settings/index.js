import React from "react";
import Octicon from "react-component-octicons";
import "./settings.css";
import RubberduckIcon from "./icon";

const chatBadge = (
  <a href="https://gitter.im/rubberduckio/Lobby" target="_blank">
    <img src="https://badges.gitter.im/gitterHQ/gitter.png" />
  </a>
);

export const SettingsButton = props => (
  <div className="button-div" onClick={props.onClick}>
    <Octicon name="gear" style={{ height: 20, width: 20 }} />
  </div>
);

const SettingsInternal = props => (
  <div className="settings-section">
    <div className="settings-sub-section">
      <RubberduckIcon size="60" />
      <h3>Rubberduck</h3>
      <div>Version 0.1.18</div>
      <div>
        <a href="https://www.rubberduck.io">Visit website</a>
      </div>
    </div>
    <div className="settings-sub-section">
      <h4>Support</h4>
      <div>{chatBadge}</div>
      <div>team@karigari.io</div>
    </div>
    <div className="settings-sub-section">
      <a className="pointer" onClick={props.onLogout}>
        Logout
      </a>
    </div>
  </div>
);

export const Settings = props =>
  props.isVisible ? <SettingsInternal {...props} /> : null;
