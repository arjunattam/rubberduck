import React from "react";
import { connect } from "react-redux";
import PropTypes from "prop-types";
import { listener as blobListener } from "./../adapters/github/views/blob";
import { listener as pullListener } from "./../adapters/github/views/pull";
import { API } from "./../utils/api";
import "./Hover.css";
import Docstring from "./common/Docstring";
import * as SessionUtils from "../utils/session";

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

class HoverListener extends React.Component {
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
    // Callback for the hover listener. API call is made if the
    // mouse locations were correctly infered by the view adapter,
    // and there is text below the mouse.
    const hasValidMouseLocation =
      hoverResult.hasOwnProperty("fileSha") &&
      hoverResult.hasOwnProperty("lineNumber");

    if (hasValidMouseLocation) {
      API.getHover(
        SessionUtils.getCurrentSessionId(this.props.storage.sessions),
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
              filePath:
                response.result.definition.location &&
                response.result.definition.location.path,
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

  onMouseOverListener(e, listener) {
    listener(e, this.receiver);
    this.setState({
      currentMouseX: e.x,
      currentMouseY: e.y
    });
  }

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
      document.body.onmouseover = e => {
        this.onMouseOverListener(e, listener);
      };
    } else {
      document.body.onmouseover = null;
    }
  };

  componentDidMount() {
    this.setupListener();
  }

  componentWillUnmount() {
    document.body.onmouseover = null;
  }

  render() {
    return <HoverBox {...this.state} />;
  }
}

function mapStateToProps(state) {
  const { storage, data } = state;
  return {
    storage,
    data
  };
}
export default connect(mapStateToProps)(HoverListener);
