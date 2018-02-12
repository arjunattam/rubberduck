import React from "react";
import PropTypes from "prop-types";
import { listener as blobListener } from "./../adapters/github/views/blob";
import { listener as pullListener } from "./../adapters/github/views/pull";
import "./Hover.css";

const docstring =
  "Example function with PEP 484 type annotations." +
  "\n" +
  "\nArgs:" +
  "\n    param1: The first parameter." +
  "\n    param2: The second parameter." +
  "\n" +
  "\nReturns:" +
  "\n    The return value. True for success, False otherwise.";

class HoverBox extends React.Component {
  static propTypes = {
    elementText: PropTypes.string,
    lineNumber: PropTypes.number,
    charNumber: PropTypes.number,
    filePath: PropTypes.string,
    fileSha: PropTypes.string,
    mouseX: PropTypes.integer,
    mouseY: PropTypes.integer
  };

  render() {
    const padding = 20;
    const docstringJSX = docstring.split("\n").map(line => {
      return (
        <span>
          {line}
          <br />
        </span>
      );
    });
    return (
      <div
        className="hover-box"
        style={{
          left: this.props.mouseX + padding,
          top: this.props.mouseY + padding
        }}
      >
        <div className="title">{this.props.elementText}</div>
        <div className="docstring">{docstringJSX}</div>
        <div className="filename">{this.props.filePath}</div>
        <div className="meta">
          {"Line: " +
            this.props.lineNumber +
            " Char: " +
            this.props.charNumber +
            " SHA: " +
            this.props.fileSha}
        </div>
      </div>
    );
  }
}

export default class HoverListener extends React.Component {
  state = {
    mouseX: -1000,
    mouseY: -1000
  };

  receiver = result => {
    // Callback for the hover listener
    this.setState(result);
  };

  setupListener = () => {
    const isFileView = window.location.href.indexOf("blob") >= 0;
    const isPRView = window.location.href.indexOf("pull") >= 0;
    let listener = null;

    if (isFileView) {
      listener = blobListener;
    } else if (isPRView) {
      listener = pullListener;
    }

    if (listener !== null) {
      const that = this;
      document.body.onmouseover = e => {
        listener(e, that.receiver);
      };
    } else {
      document.body.onmouseover = null;
    }
  };

  componentDidMount() {
    this.setupListener();
  }

  render() {
    return <HoverBox {...this.state} />;
  }
}
