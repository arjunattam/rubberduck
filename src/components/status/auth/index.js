import React from "react";
import Octicon from "react-component-octicons";
import "./auth.css";

const CloseButton = props => (
  <div className="close-dot" onClick={props.onClick}>
    <Octicon name="x" style={{ height: 11, width: 11 }} />
  </div>
);

export default class AuthPrompt extends React.Component {
  render() {
    const style = this.props.isExpanded
      ? { display: "block" }
      : { display: "none" };

    return (
      <div className="auth-prompt" style={style}>
        <h3>401</h3>
        <p>Not authorised to work with your private repositories.</p>
        <p>Login with GitHub to continue.</p>
      </div>
    );
  }
}
