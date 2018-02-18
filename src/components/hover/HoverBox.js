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
    x: PropTypes.number,
    y: PropTypes.number,
    onReferences: PropTypes.func,
    onDefinition: PropTypes.func
  };

  render() {
    return (
      <div
        className="hover-box"
        style={{
          left: this.props.x,
          bottom: window.innerHeight - this.props.y
        }}
      >
        <div className="title monospace">{this.props.name}</div>
        <div className="docstring">
          {Docstring(atob(this.props.docstring || ""))}
        </div>
        <div className="filename">{this.props.filePath}</div>
        <div className="buttons">
          <a className="button" onClick={this.props.onReferences}>
            See usages
          </a>{" "}
          <a className="button" onClick={this.props.onDefinition}>
            Open definition
          </a>
        </div>
      </div>
    );
  }
}
