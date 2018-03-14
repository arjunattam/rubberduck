import React from "react";
import { connect } from "react-redux";
import "status-indicator/styles.css";
import "./SessionStatus.css";

class SessionStatus extends React.Component {
  render() {
    const indicator =
      this.props.data.sessionStatus === "ready" ? (
        <status-indicator positive />
      ) : (
        <status-indicator intermediary pulse />
      );

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
