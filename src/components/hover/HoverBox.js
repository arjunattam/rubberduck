import React from "react";
import PropTypes from "prop-types";
import Docstring from "../common/Docstring";
import "./Hover.css";

export default class HoverBox extends React.Component {
  // Presentation component for the hover box
  static propTypes = {
    name: PropTypes.string,
    docstring: PropTypes.string,
    lineNumber: PropTypes.number,
    charNumber: PropTypes.number,
    filePath: PropTypes.string,
    fileSha: PropTypes.string,
    mouseX: PropTypes.number,
    mouseY: PropTypes.number
  };

  render() {
    const padding = 20;
    return (
      <div
        className="hover-box"
        style={{
          left: this.props.mouseX + padding,
          top: this.props.mouseY + padding
        }}
      >
        <div className="title monospace">{this.props.name}</div>
        <div className="docstring">
          {Docstring(atob(this.props.docstring || ""))}
        </div>
        <div className="filename">{this.props.filePath}</div>
      </div>
    );
  }
}
