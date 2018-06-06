import React from "react";
import Octicon from "react-component-octicons";
import "status-indicator/styles.css";
import "./index.css";

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

const ProgressBar = ({ session }) => {
  const { progress } = session;
  const width = `${progress}%`;
  return <div className="session-progress-bar" style={{ width }} />;
};

const Indicator = ({ session }) => {
  const { status } = session;
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

const StatusText = ({ session }) => {
  const { status } = session;
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

const SettingsLink = ({ text, onClick }) => {
  let icon = "gear";
  switch (text) {
    case "collapse":
      icon = "x";
      break;
    case "help":
      icon = "question";
      break;
    default:
      icon = "gear";
  }
  return (
    <div className="session-status-link" onClick={onClick}>
      {text} <Octicon name={icon} style={{ height: 14 }} />
    </div>
  );
};

export default class StatusBar extends React.Component {
  state = {
    showNotReady: null,
    isShowingWarning: false
  };

  componentWillReceiveProps(newProps) {
    if (newProps.session.showNotReady !== this.state.showNotReady) {
      this.setState({
        showNotReady: newProps.session.showNotReady,
        isShowingWarning: true
      });
      setTimeout(() => {
        this.setState({ isShowingWarning: false });
      }, 1500);
    }
  }

  renderNormal = () => {
    const { supportLink, session, onClick, isExpanded } = this.props;
    let linkText = supportLink ? "help" : "settings";
    linkText = isExpanded ? "collapse" : linkText;
    return (
      <div className="session-status">
        <div className="session-status-name">
          <Indicator session={session} />
          <StatusText session={session} />
        </div>
        <SettingsLink text={linkText} onClick={onClick} />
      </div>
    );
  };

  renderWarning = () => {
    return (
      <div className="session-status not-ready">
        <div>Waiting for ready</div>
      </div>
    );
  };

  renderStatus = () => {
    return this.state.isShowingWarning
      ? this.renderWarning()
      : this.renderNormal();
  };

  render() {
    const { session } = this.props;
    return (
      <div className="session-status-container">
        {this.renderStatus()}
        <ProgressBar session={session} />
      </div>
    );
  }
}
