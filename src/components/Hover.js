import React from "react";
import PropTypes from "prop-types";
import { listener as blobListener } from "./../adapters/github/views/blob";
import { listener as pullListener } from "./../adapters/github/views/pull";
import { API } from "./../utils/api";
import "./Hover.css";
import Docstring from "./common/Docstring";

const sessionId = "7b8ccbba-3db0-40e5-a7af-6e4a3e69f40d";

class HoverBox extends React.Component {
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

export default class HoverListener extends React.Component {
  state = {
    mouseX: -1000,
    mouseY: -1000
  };

  isOverlappingWithCurrent = (x, y) => {
    const xdiff = Math.abs(x - this.state.currentMouseX);
    const ydiff = Math.abs(y - this.state.currentMouseY);
    return xdiff < 5 && ydiff < 5;
  };

  receiver = hoverResult => {
    // Callback for the hover listener
    const isValidResult =
      hoverResult.hasOwnProperty("fileSha") &&
      hoverResult.hasOwnProperty("lineNumber");

    if (isValidResult) {
      API.getHover(
        sessionId,
        hoverResult.fileSha,
        hoverResult.filePath,
        hoverResult.lineNumber,
        hoverResult.charNumber
      )
        .then(response => {
          if (
            this.isOverlappingWithCurrent(
              hoverResult.mouseX,
              hoverResult.mouseY
            )
          ) {
            // We will set state only if the current
            // mouse location overlaps with the response
            this.setState({
              name: response.result.name,
              type: response.result.type,
              docstring: response.result.docstring,
              filePath: response.result.definition.location.path,
              mouseX: hoverResult.mouseX,
              mouseY: hoverResult.mouseY
            });
          }
        })
        .catch(error => {
          console.log("Error in API call", error);
        });
    } else {
      this.setState({ mouseX: -1000, mouseY: -1000 });
    }
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
        this.setState({
          currentMouseX: e.x,
          currentMouseY: e.y
        });
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
