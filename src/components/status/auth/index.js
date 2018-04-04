import React from "react";
import Octicon from "react-component-octicons";
import { getGitService } from "../../../adapters";
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

    const service = getGitService() === "bitbucket" ? "Bitbucket" : "GitHub";

    return (
      <div className="auth-prompt" style={style}>
        <h3>401</h3>
        <p>Not authorised to access your private repositories.</p>
        <p>Login with {service} to continue.</p>
      </div>
    );
  }
}
