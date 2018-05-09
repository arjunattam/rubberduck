import React from "react";
import Octicon from "react-component-octicons";
import "./settings.css";
import RubberduckIcon from "./icon";

export const VERSION = "0.2.14";

const slackLink =
  "https://join.slack.com/t/karigarihq/shared_invite/enQtMzM5NzQxNjQxNTA1LTM0ZDFhNWQ3YmEyYmExZTY1ODJmM2U3NzExM2E0YmQxODcxYTgwYzczOTVkOGY5ODk2MWE0MzE2ODliNGU1ZDc";

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
      <div>Version {VERSION}</div>
      <div>
        <a href="https://www.rubberduck.io">Visit website</a>
      </div>
    </div>
    <div className="settings-sub-section">
      <h4>Support</h4>
      <div>
        <a href={slackLink}>Join us on Slack</a>
      </div>
      <div>team@rubberduck.io</div>
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
