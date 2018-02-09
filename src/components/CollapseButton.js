import React from "react";
import "./CollapseButton.css";

export default class CollapseButton extends React.Component {
  // TODO (arjun): when the page is scrolled, and the view is shown,
  // the page scrolls up. This needs to be fixed.

  render() {
    const text = this.props.isVisible ? "←" : "→";
    const classMod = this.props.isVisible ? "shown" : "";

    return (
      <div
        className={"collapse-container " + classMod}
        onClick={this.props.onClick}
      >
        {text}
      </div>
    );
  }
}
