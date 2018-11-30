import * as React from "react";
import { BaseSection, CustomButton } from "./base";

const AUTH_LINK =
  "https://github.com/karigari/rubberduck/blob/master/docs/AUTHENTICATION.md";

export class AuthSection extends React.Component<{}, any> {
  state = {
    githubAccessToken: "",
    isPassword: true
  };

  componentDidMount() {
    chrome.storage.local.get({ ...this.state }, items => {
      this.setState({
        githubAccessToken: items.githubAccessToken || ""
      });
    });
  }

  onTokenChange(value) {
    this.setState({ githubAccessToken: value }, () => {
      chrome.storage.local.set({
        githubAccessToken: this.state.githubAccessToken
      });
    });
  }

  clearToken() {
    return this.onTokenChange("");
  }

  togglePassword() {
    this.setState({ isPassword: !this.state.isPassword });
  }

  render() {
    const showText = this.state.isPassword ? `Show` : `Hide`;
    return (
      <BaseSection title={"Authentication"}>
        <div className="input-group mb-3">
          <input
            type={this.state.isPassword ? "password" : "text"}
            onChange={e => this.onTokenChange(e.target.value)}
            value={this.state.githubAccessToken}
            className="form-control"
            placeholder="Github Access Token"
            aria-label="Github Access Token"
            aria-describedby="basic-addon2"
          />
          <div className="input-group-append">
            <button
              className="btn btn-outline-secondary"
              type="button"
              onClick={() => this.togglePassword()}
            >
              {showText}
            </button>
            <button
              className="btn btn-outline-secondary"
              type="button"
              onClick={() => this.clearToken()}
            >
              Clear
            </button>
          </div>
        </div>
        <CustomButton onClick={() => window.open(AUTH_LINK)}>
          Get a token
        </CustomButton>
      </BaseSection>
    );
  }
}
