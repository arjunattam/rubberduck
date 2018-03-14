import React from "react";
import Octicon from "react-component-octicons";
import "./CollapseButton.css";

export default class CollapseButton extends React.Component {
  render() {
    const icon = (
      <Octicon
        name={this.props.isVisible ? "chevron-left" : "chevron-right"}
        style={{ height: 20, width: 20 }}
      />
    );
    const classMod = this.props.isVisible ? "shown" : "";

    return (
      <div
        className={"button-div collapse-container " + classMod}
        onClick={this.props.onClick}
      >
        {icon}
      </div>
    );
  }
}
