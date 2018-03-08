import React from "react";
import { connect } from "react-redux";
import "./SessionStatus.css";

const start = "#fff6dc";
const end = "#dbffcc";

class SessionStatus extends React.Component {
  render() {
    const readyStyle = { background: end };
    const style = this.props.data.sessionStatus === "ready" ? readyStyle : null;

    return (
      <div>
        <div className="session-status-bar" style={style}>
          Session: {this.props.data.sessionStatus}
        </div>
        <div className="session-status-bar">
          API: {this.props.data.apiStatus}
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
