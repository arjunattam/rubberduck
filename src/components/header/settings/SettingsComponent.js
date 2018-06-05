import React from "react";
import RubberduckIcon from "../../icon";
import SegmentControl from "./segmented";
import { SupportSection, IconSection } from "./support";
import "./Settings.css";

class MenuAppSettings extends React.Component {
  render() {
    const { defaultPort, onPortChange } = this.props;
    return (
      <ul className="settings-sub-list">
        <li>
          <a
            href="https://support.rubberduck.io/articles/26915"
            target="_blank"
          >
            Get started ↗
          </a>
        </li>
        <li>
          <a
            href="https://support.rubberduck.io/articles/26916"
            target="_blank"
          >
            Setup authorization ↗
          </a>
        </li>
        <li>
          <div>Use default port</div>
          <div>
            <input type="text" value={defaultPort} onChange={onPortChange} />
          </div>
        </li>
        <li>
          <div>Menu app TCP port</div>
          <div>
            <input type="text" value={defaultPort} onChange={onPortChange} />
          </div>
        </li>
      </ul>
    );
  }
}

const CloudSettings = ({ onLogout, authState }) => {
  return (
    <ul className="settings-sub-list">
      <li>
        <a href="https://support.rubberduck.io/articles/26923" target="_blank">
          Using on private repos ↗
        </a>
      </li>
      <li>{authState}</li>
      <li>
        <a className="pointer" onClick={onLogout}>
          Logout
        </a>
      </li>
    </ul>
  );
};

const EnvironmentSettings = props => {
  const { hasMenuApp, defaultPort, onMenuChange, onPortChange } = props;
  return (
    <div className="settings-sub-section">
      <SegmentControl onChange={onMenuChange} hasMenuApp={hasMenuApp} />
      {hasMenuApp ? (
        <MenuAppSettings
          defaultPort={defaultPort}
          onPortChange={onPortChange}
        />
      ) : (
        <CloudSettings onLogout={props.onLogout} authState={props.authState} />
      )}
    </div>
  );
};

const getClassName = ({ isVisible }) => {
  const nameModifier = isVisible ? "" : "settings-section-hidden";
  return `${nameModifier} settings-section`;
};

const SettingsInternal = props => (
  <div className={getClassName(props)}>
    <EnvironmentSettings {...props} />
    <IconSection />
    <SupportSection />
  </div>
);

export default SettingsInternal;
