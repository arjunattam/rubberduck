import * as React from "react";

export class AuthSection extends React.Component<{}, any> {
  state = {
    githubAccessToken: ""
  };

  componentDidMount() {
    chrome.storage.local.get({ ...this.state }, items => {
      this.setState({
        githubAccessToken: items.githubAccessToken || ""
      });
    });
  }

  onTokenChange(e) {
    this.setState({ githubAccessToken: e.target.value }, () => {
      chrome.storage.local.set({
        githubAccessToken: this.state.githubAccessToken
      });
    });
  }

  render() {
    return (
      <div>
        <h2>Authentication</h2>
        <p>Github Access Token</p>
        <p>
          <input
            onChange={e => this.onTokenChange(e)}
            type="password"
            value={this.state.githubAccessToken}
          />
        </p>
      </div>
    );
  }
}
