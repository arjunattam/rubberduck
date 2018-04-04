import React from "react";
import Octicon from "react-component-octicons";
import { getGitService } from "../../../adapters";
import "./auth.css";

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
