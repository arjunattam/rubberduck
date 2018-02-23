import React from "react";
import Octicon from "react-component-octicons";
import "./CollapseButton.css";

export default class CollapseButton extends React.Component {
  render() {
    const icon = this.props.isVisible ? (
      <Octicon name="chevron-left" style={{ height: 20, width: 20 }} />
    ) : (
      <Octicon name="chevron-right" style={{ height: 20, width: 20 }} />
    );
    const classMod = this.props.isVisible ? "shown" : "";

    return (
      <div
        className={"collapse-container " + classMod}
        onClick={this.props.onClick}
      >
        {icon}
      </div>
    );
  }
}
