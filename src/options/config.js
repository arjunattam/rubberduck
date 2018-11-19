import React from "react";

export class ExistingOptions extends React.Component {
  state = {
    hasHoverDebug: false
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
      </div>
    );
  }
}
