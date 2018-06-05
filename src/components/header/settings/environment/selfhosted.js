import React from "react";
import PropTypes from "prop-types";
import { NewTabLink } from "./common";

const DEFAULT_PORT = "9898";

export default class MenuAppSettings extends React.Component {
  static propTypes = {
    portNumber: PropTypes.string.isRequired,
    onPortChange: PropTypes.func.isRequired
  };

  state = {
    isDefault: this.props.portNumber === DEFAULT_PORT
  };

  onDefaultChange = event => {
    const isDefault = event.target.checked;
    this.setState({ isDefault: isDefault }, () => {
      // Check if the port number is default. If not, set it as default
      if (this.props.portNumber !== DEFAULT_PORT) {
        this.props.onPortChange(DEFAULT_PORT);
      }
    });
  };

  onPortChange = event => {
    // TODO(arjun): add debounce or something
    const { onPortChange: parentPortChange } = this.props;
    const { value: newValue } = event.target;
    parentPortChange(newValue);
  };

  render() {
    return (
      <ul className="settings-sub-list">
        <li>
          <NewTabLink
            link="https://support.rubberduck.io/articles/26915"
            label="Get started"
          />
        </li>
        <li>
          <NewTabLink
            link="https://support.rubberduck.io/articles/26916"
            label="Setup authorization"
          />
        </li>
        <li>
          <div>Use default configuration</div>
          <div>
            <input
              type="checkbox"
              checked={this.state.isDefault}
              onChange={this.onDefaultChange}
            />
          </div>
        </li>
        <li>
          <div>Menu app TCP port</div>
          <div>
            <input
              type="text"
              disabled={this.state.isDefault}
              value={this.props.portNumber}
              onChange={this.onPortChange}
            />
          </div>
        </li>
      </ul>
    );
  }
}
