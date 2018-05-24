import React from "react";
import Octicon from "react-component-octicons";
import RubberduckIcon from "./icon";

export const VERSION = "0.2.18";

const slack =
  "https://join.slack.com/t/karigarihq/shared_invite/enQtMzM5NzQxNjQxNTA1LTM0ZDFhNWQ3YmEyYmExZTY1ODJmM2U3NzExM2E0YmQxODcxYTgwYzczOTVkOGY5ODk2MWE0MzE2ODliNGU1ZDc";

const twitter = "https://twitter.com/getrubberduck";

const website = "https://www.rubberduck.io";

const email = "team@rubberduck.io";

const mailto = `mailto:${email}`;

export const GearButton = props => (
  <div className="button-div" onClick={props.onClick}>
    <Octicon name="gear" style={{ height: 20, width: 20 }} />
  </div>
);

const IconSection = props => (
  <div className="settings-sub-section">
    <div className="row">
      <div>
        <h5>Rubberduck</h5>
        v{VERSION} · <a href={twitter}>Changelog</a> ·{" "}
        <a href={website}>Website</a>
      </div>
      <div>
        <RubberduckIcon size="24" />
      </div>
    </div>
    <div />
  </div>
);

const SupportSection = props => (
  <div className="settings-sub-section">
    <h5>Support</h5>
    <div>
      <a href={slack}>Slack</a> · <a href={twitter}>Twitter</a> ·{" "}
      <a href={mailto}>Email</a>
    </div>
  </div>
);

const ConfigSection = ({
  hasMenuApp,
  defaultPort,
  onMenuChange,
  onPortChange
}) => {
  return (
    <div className="settings-sub-section">
      <h5>Configuration</h5>
      <div className="row">
        <div>Use with menu app [BETA]</div>
        <div>
          <input type="checkbox" checked={hasMenuApp} onChange={onMenuChange} />
        </div>
      </div>
      <div className="row">
        <div>Menu app TCP port</div>
        <div>
          <input type="text" value={defaultPort} onChange={onPortChange} />
        </div>
      </div>
    </div>
  );
};

const LogoutSection = ({ onLogout }) => (
  <div className="settings-sub-section">
    <a className="pointer" onClick={onLogout}>
      Logout
    </a>
  </div>
);

const SettingsInternal = props => (
  <div className="settings-section">
    <IconSection />
    <ConfigSection {...props} />
    <SupportSection />
    <LogoutSection {...props} />
  </div>
);

export const Settings = props =>
  props.isVisible ? <SettingsInternal {...props} /> : null;
