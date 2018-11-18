import React from "react";

export class ExistingOptions extends React.Component {
  state = {
    hasHoverDebug: false,
    hasMenuApp: false,
    defaultPort: 8000
  };

  componentDidMount() {
    chrome.storage.local.get({ ...this.state }, items => {
      this.setState({
        ...items
      });
    });
  }

  onHoverChange() {
    this.setState({ hasHoverDebug: !this.state.hasHoverDebug }, () => {
      chrome.storage.local.set({ hasHoverDebug: this.state.hasHoverDebug });
    });
  }

  onMenuChange() {
    this.setState({ hasMenuApp: !this.state.hasMenuApp }, () => {
      chrome.storage.local.set({ hasMenuApp: this.state.hasMenuApp });
    });
  }

  onPortChange(event) {
    this.setState({ defaultPort: event.target.value }, () => {
      chrome.storage.local.set({ defaultPort: this.state.defaultPort });
    });
  }

  render() {
    return (
      <div>
        <h2>Configuration</h2>
        <p>
          <label>
            <input
              type="checkbox"
              onChange={() => this.onHoverChange()}
              checked={this.state.hasHoverDebug}
            />
            Hover debug mode
          </label>
        </p>
        <p>
          <label>
            <input
              type="checkbox"
              onChange={() => this.onMenuChange()}
              checked={this.state.hasMenuApp}
            />
            Use with menu bar app
          </label>
        </p>
        <p>
          <label>
            Default port
            <input
              type="text"
              value={this.state.defaultPort}
              onChange={evt => this.onPortChange(evt)}
            />
          </label>
        </p>
      </div>
    );
  }
}
