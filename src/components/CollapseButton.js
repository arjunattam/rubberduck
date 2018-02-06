import React from "react";
import "./CollapseButton.css";

export default class CollapseButton extends React.Component {
  render() {
    const text = this.props.isVisible ? "hide" : "show";
    const classMod = this.props.isVisible ? "shown" : "";

    return (
      <div className={"collapse-container " + classMod}>
        <a href="#" onClick={this.props.onClick}>
          {text}
        </a>
      </div>
    );
  }
}
