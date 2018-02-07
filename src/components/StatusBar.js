import React from "react";
import "./StatusBar.css";
import { encodeQueryData, getParameterByName } from "./../utils/api";
import { sendMessage, constructMessage } from "./../utils/chrome";
import { setLocal, getLocal } from "./../utils/storage";

export default class StatusBar extends React.Component {
  // TODO(arjun): update the login url and response handling
  state = {
    token: "no token"
  };

  componentDidMount() {
    getLocal("accessToken", value => {
      this.setState({ token: value });
    });
  }

  launchFlow = () => {
    // If token already exists we probably need to do any of this
    const url = "http://staging.codeview.io/signup/";
    const message = constructMessage("TRIGGER_AUTH", { url: url });
    sendMessage(message, response => {
      // this.handleAuth(response); // callback for message sent
      console.log(response);
    });
  };

  render() {
    return (
      <div className="status">
        <a href="#" onClick={this.launchFlow}>
          Login
        </a>
        <p>{this.state.token}</p>
      </div>
    );
  }
}
