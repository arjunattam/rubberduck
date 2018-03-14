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
*/

class SessionStatus extends React.Component {
  state = { showNotReady: null };

  renderIndicator = () => {
    switch (this.props.data.sessionStatus) {
      case "ready":
        return <status-indicator positive />;
      case "disconnected":
      case "error":
        return <status-indicator negative />;
      case "unsupported_language":
        return <status-indicator active />;
      default:
        return <status-indicator intermediary pulse />;
    }
  };

  getText = () => {
    switch (this.props.data.sessionStatus) {
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
      default:
        return this.props.data.sessionStatus;
    }
  };

  showNotReady = () => {
    const element = document.querySelector(".session-status-inner");
    element.classList.remove("status-animation");
    element.classList.add("status-animation");
  };

  componentWillReceiveProps(newProps) {
    if (newProps.data.showNotReady !== this.state.showNotReady) {
      this.showNotReady();
      this.setState({
        showNotReady: newProps.data.showNotReady
      });
    }
  }

  render() {
    return (
      <div className="session-status-container">
        <div className="session-status-inner">
          <div className="session-status">
            {this.renderIndicator()}
            <span className="session-status-text">{this.getText()}</span>
          </div>
          <div className="session-status-not-ready">Waiting to be ready</div>
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
