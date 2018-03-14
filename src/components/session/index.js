import React from "react";
import { connect } from "react-redux";
import "status-indicator/styles.css";
import "./SessionStatus.css";

class SessionStatus extends React.Component {
  render() {
    let indicator;
    switch (this.props.data.sessionStatus) {
      case "ready":
        indicator = <status-indicator positive />;
        break;
      case "error":
        indicator = <status-indicator negative />;
        break;
      default:
        indicator = <status-indicator intermediary pulse />;
    }

    return (
      <div className="session-status-container">
        {indicator}
        <span className="session-status-text">
          {this.props.data.sessionStatus}
        </span>
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
