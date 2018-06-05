import React from "react";
import RubberduckIcon from "../../icon";
import "./StatusBar.css";

const VERSION = "0.2.21";

const slack =
  "https://join.slack.com/t/karigarihq/shared_invite/enQtMzM5NzQxNjQxNTA1LTM0ZDFhNWQ3YmEyYmExZTY1ODJmM2U3NzExM2E0YmQxODcxYTgwYzczOTVkOGY5ODk2MWE0MzE2ODliNGU1ZDc";

const twitter = "https://twitter.com/getrubberduck";

const changelog = "https://www.rubberduck.io/blog";

const email = "team@rubberduck.io";

const mailto = `mailto:${email}`;

const IconSection = props => (
  <div className="settings-sub-section">
    <div className="row">
      <div>
        <h5>Rubberduck</h5>
        v{VERSION} ·{" "}
        <a href={changelog} target="_blank">
          Changelog
        </a>
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

const SettingsStatus = ({ authState, hasMenuApp, defaultPort }) =>
  hasMenuApp ? (
    <div className="tree-status">{`menu app (${defaultPort})`}</div>
  ) : (
    <div>{authState}</div>
  );

const SettingsPreview = props =>
  props.isLoading ? (
    <div className="status-loader" style={{ width: 15, height: 15 }} />
  ) : (
    <div className="settings-sub-section">
      <SettingsStatus {...props} />
    </div>
  );

const SettingsInternal = props => (
  <div className="settings-section">
    <SettingsPreview {...props} />
    <ConfigSection {...props} />
    <IconSection />
    <SupportSection />
    <LogoutSection {...props} />
  </div>
);

export default SettingsInternal;
