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

const SUPPORT_LINKS_BASIC = {
  unsupported_language: "https://support.rubberduck.io/articles/26922",
  no_access: "https://support.rubberduck.io/articles/26923"
};

const SUPPORT_LINKS_SELF_HOSTED = {
  disconnected: "https://support.rubberduck.io/articles/26924",
  unsupported_language: "https://support.rubberduck.io/articles/26922",
  no_access: "https://support.rubberduck.io/articles/26916"
};

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
  const icon = text === "collapse" ? "x" : "gear";
  return (
    <div className="session-status-link" onClick={onClick}>
      {text} <Octicon name={icon} style={{ height: 14 }} />
    </div>
  );
};

const StatusBar = props => {
  const { session, onClick, isExpanded } = props;
  const linkText = isExpanded ? "collapse" : "settings";
  return (
    <div className="session-status-container">
      <div className="session-status">
        <div>
          <Indicator session={session} />
          <StatusText session={session} />
        </div>
        <SettingsLink text={linkText} onClick={onClick} />
      </div>
      <ProgressBar session={session} />
    </div>
  );
};

export default StatusBar;

class SessionStatus extends React.Component {
  state = { showNotReady: null };

  // renderSupportLink = () => {
  //   const { status } = this.props.data.session;
  //   const { hasMenuApp } = this.props.storage;
  //   let href = "";

  //   if (hasMenuApp) {
  //     href = SUPPORT_LINKS_SELF_HOSTED[status];
  //   } else {
  //     href = SUPPORT_LINKS_BASIC[status];
  //   }

  //   let text = "Support →";

  //   if (hasMenuApp) {
  //     const configurableStatuses = ["no_access", "disconnected"];
  //     if (configurableStatuses.indexOf(status) >= 0) {
  //       text = "Configure →";
  //     }
  //   }

  //   return href ? (
  //     <a href={href} target="_blank">
  //       {text}
  //     </a>
  //   ) : null;
  // };

  showNotReady = () => {
    const element = document.querySelector(".session-status-inner");
    element.classList.remove("status-animation");
    void element.offsetWidth;
    element.classList.add("status-animation");
  };

  componentWillReceiveProps(newProps) {
    if (newProps.data.session.showNotReady !== this.state.showNotReady) {
      this.showNotReady();
      this.setState({
        showNotReady: newProps.data.session.showNotReady
      });
    }
  }

  // renderNotReady = () => {
  //   return <div className="session-status-not-ready">Waiting to be ready</div>;
  // };

  render() {
    const { session } = this.props.data;
    return (
      <div className="session-status-container">
        <div className="session-status-inner">
          <div className="session-status">
            <Indicator session={session} />
            <span className="session-status-text">
              <StatusText session={session} />
            </span>
          </div>
          {/* {this.renderNotReady()} */}
        </div>
        <ProgressBar session={session} />
      </div>
    );
  }
}
