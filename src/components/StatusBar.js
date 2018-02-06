import React from "react";
import "./StatusBar.css";
import { encodeQueryData, getParameterByName, getToken } from "./../utils/api";
import { sendMessage, constructMessage } from "./../utils/chrome";
import { setLocal, getLocal } from "./../utils/storage";

export default class StatusBar extends React.Component {
  state = {
    token: "no token"
  };

  handleAuth = redirectUrl => {
    // TODO(arjun): check if this is a valid url, else raise error
    // Extract token and save to db
    const code = getParameterByName("code", redirectUrl);
    getToken(code).then(response => {
      // Appending & to the data response so that we can reuse the param util
      const token = getParameterByName("access_token", "&" + response.data);
      // TODO(arjun): standardise the keys for local storage
      setLocal("accessToken", token, () => {
        this.setState({ token: token });
      });
    });
  };

  componentDidMount() {
    getLocal("accessToken", value => {
      this.setState({ token: value });
    });
  }

  launchFlow = () => {
    // If token already exists we probably need to do any of this
    const data = {
      client_id: "6e58defbed2f902a8429",
      state: (Math.random() + 1).toString(36).substring(7), // random string
      scope: "repo"
    };
    const queryParams = encodeQueryData(data);
    const url = "https://github.com/login/oauth/authorize?" + queryParams;
    const message = constructMessage("TRIGGER_AUTH", { url: url });
    sendMessage(message, response => {
      this.handleAuth(response); // callback for message sent
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
