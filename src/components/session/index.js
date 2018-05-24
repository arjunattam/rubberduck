import React from "react";
import { connect } from "react-redux";
import "status-indicator/styles.css";
import "./SessionStatus.css";

/*
Possible values
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

const ProgressBar = ({ value }) => {
  const width = `${value}%`;
  return (
    <div>
      <div className="session-progress-bar" style={{ width }} />
    </div>
  );
};

class SessionStatus extends React.Component {
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
        return "preparing";
      case "initiated":
        return "indexing";
      case "unsupported_language":
        return "language not supported";
      case "no_session":
        return "inactive";
      case "no_access":
        return "not authorised";
      default:
        return status;
    }
  };

  getProgress = () => {
    const { status, progress } = this.props.data.session;
    const filteredStatus = this.getText(status);
    const startAt = {
      connecting: 0,
      initializing: 10,
      indexing: 90,
      ready: 100
    };
    if (filteredStatus === "preparing") {
      const baseProgress = status === "fetched_details" ? 20 : 90;
      const proratedProgress = progress ? progress / 100.0 : 0;
      return baseProgress + proratedProgress * 70;
    } else {
      return startAt[filteredStatus];
    }
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

  renderStatus = () => {
    const statusText = this.getText();
    return (
      <div className="session-status">
        {this.renderIndicator()}
        <span className="session-status-text">{statusText}</span>
      </div>
    );
  };

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

function mapStateToProps(state) {
  const { storage, data } = state;
  return {
    storage,
    data
  };
}
export default connect(mapStateToProps)(SessionStatus);
