import React from "react";
import "status-indicator/styles.css";
import "./SessionStatus.css";

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

const ProgressBar = ({ value }) => {
  const width = `${value}%`;
  return (
    <div>
      <div className="session-progress-bar" style={{ width }} />
    </div>
  );
};

export default class SessionStatus extends React.Component {
  state = { showNotReady: null };

  renderIndicator = () => {
    const { status } = this.props.data.session;
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

  getText = () => {
    const { status } = this.props.data.session;
    switch (status) {
      case "creating":
        return "initializing";
      case "created":
      case "fetched_details":
      case "cloned_base_repo":
      case "setup_base_repo":
      case "cloned_head_repo":
        return "one-time preparation";
      case "initiated":
        return "indexing";
      case "unsupported_language":
        return "language not supported";
      case "no_session":
        return "inactive";
      case "no_access":
        return "not authorised";
      case "disconnected":
        return "unable to connect";
      default:
        return status;
    }
  };

  getProgress = () => {
    const { progress } = this.props.data.session;
    return progress;
  };

  renderSupportLink = () => {
    const { status } = this.props.data.session;
    const { hasMenuApp } = this.props.storage;
    let href = "";

    if (hasMenuApp) {
      href = SUPPORT_LINKS_SELF_HOSTED[status];
    } else {
      href = SUPPORT_LINKS_BASIC[status];
    }

    let text = "Support →";

    if (hasMenuApp) {
      const configurableStatuses = ["no_access", "disconnected"];
      if (configurableStatuses.indexOf(status) >= 0) {
        text = "Configure →";
      }
    }

    return href ? (
      <a href={href} target="_blank">
        {text}
      </a>
    ) : null;
  };

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

  renderProgressBar = () => <ProgressBar value={this.getProgress()} />;

  renderStatus = () => (
    <div className="session-status">
      <div>
        {this.renderIndicator()}
        <span className="session-status-text">{this.getText()}</span>
      </div>
      <div className="session-status-link">{this.renderSupportLink()}</div>
    </div>
  );

  renderNotReady = () => {
    return <div className="session-status-not-ready">Waiting to be ready</div>;
  };

  render() {
    return (
      <div className="session-status-container">
        {this.renderProgressBar()}
        <div className="session-status-inner">
          {this.renderStatus()}
          {this.renderNotReady()}
        </div>
      </div>
    );
  }
}
