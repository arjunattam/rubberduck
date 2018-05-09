import React from "react";
import Codebox from "./Codebox";
import Title from "./Title";
import "./ExpandedCode.css";

const MAX_HEIGHT = 400; // pixels
const PADDING = 75;

export default class ExpandedCode extends React.Component {
  getStyle = () => {
    let { top } = this.props.style;

    // This `top` could mean box is too close to the bottom of the window
    if (top + MAX_HEIGHT + PADDING >= window.innerHeight) {
      top = window.innerHeight - MAX_HEIGHT - PADDING;
    }

    return { ...this.props.style, top };
  };

  render() {
    return (
      <div className="expanded-code" style={this.getStyle()}>
        <Title {...this.props} />
        <Codebox {...this.props} />
      </div>
    );
  }
}
