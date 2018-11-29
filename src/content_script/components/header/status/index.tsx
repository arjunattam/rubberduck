import * as React from "react";
import Octicon, { OcticonSymbol } from "react-component-octicons";
import "status-indicator/styles.css";
import "./index.css";

const SETTINGS_URL = `chrome-extension://${chrome.runtime.id}/options.html`;

/*
Possible values for status
- connecting
- disconnected

- creating
- created
- fetched_details
- cloned_base_repo
- setup_base_repo
- cloned_head_repo
- initiated

- ready

- unsupported_language
- no_session
- no_access
*/

const ProgressBar = ({ progressValue }) => {
  const width = `${progressValue}%`;
  return <div className="session-progress-bar" style={{ width }} />;
};

const Indicator = ({ status }) => {
  switch (status) {
    case "ready":
      return <status-indicator positive />;
    case "disconnected":
    case "error":
      return <status-indicator negative />;
    case "unsupported_language":
    case "no_session":
    case "no_access":
      return <status-indicator active />;
    default:
      return <status-indicator intermediary pulse />;
  }
};

const StatusText = ({ status }) => {
  let text = status;
  switch (status) {
    case "creating":
      text = "initializing";
      break;
    case "created":
    case "fetched_details":
    case "cloned_base_repo":
    case "setup_base_repo":
    case "cloned_head_repo":
      text = "one-time preparation";
      break;
    case "initiated":
      text = "indexing";
      break;
    case "unsupported_language":
      text = "language not supported";
      break;
    case "no_session":
      text = "inactive";
      break;
    case "no_access":
      text = "not authorised";
      break;
    case "disconnected":
      text = "unable to connect";
      break;
    default:
      text = status;
  }
  return <span className="session-status-text">{text}</span>;
};

const SettingsLink = () => {
  let icon: OcticonSymbol = "gear";
  return (
    <div
      className="session-status-link"
      onClick={() => window.open(SETTINGS_URL)}
    >
      {"settings"} <Octicon name={icon} style={{ height: 14 }} />
    </div>
  );
};

export const StatusBar = ({
  status,
  progress
}: {
  status: string;
  progress: number;
}) => {
  return (
    <div className="session-status-container">
      <div className="session-status">
        <div className="session-status-name">
          <Indicator status={status} />
          <StatusText status={status} />
        </div>
        <SettingsLink />
      </div>
      <ProgressBar progressValue={progress} />
    </div>
  );
};
