import * as React from "react";
import { BaseSection } from "./base";

export class InternalConfig extends React.Component<{}, any> {
  state = {
    hasHoverDebug: false
  };

  componentDidMount() {
    chrome.storage.local.get({ ...this.state }, items => {
      this.setState({
        hasHoverDebug: items.hasHoverDebug
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
      <BaseSection title={"Debugging options"}>
        <div className="form-check">
          <input
            className="form-check-input"
            type="checkbox"
            value=""
            id="defaultCheck1"
            onChange={() => this.onHoverChange()}
            checked={this.state.hasHoverDebug}
          />
          <label className="form-check-label" htmlFor="defaultCheck1">
            Enable hover debug mode
          </label>
        </div>
      </BaseSection>
    );
  }
}
