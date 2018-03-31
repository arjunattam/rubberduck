import React from "react";
import PropTypes from "prop-types";
import Docstring from "../common/Docstring";
import CodeNode from "../common/CodeNode";
import "./Hover.css";

const MAX_HEIGHT = 240;
const MAX_WIDTH = 300;

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
    boundRect: PropTypes.object,
    onReferences: PropTypes.func,
    onDefinition: PropTypes.func
  };

  renderButtons = () => {
    return (
      <div className="button-container">
        <a
          className="button-div hover-button"
          onClick={this.props.onReferences}
        >
          Find usages
        </a>
        <a
          className="button-div hover-button"
          onClick={this.props.onDefinition}
        >
          Open definition
        </a>
      </div>
    );
  };

  getPosition = () => {
    // This decides where the hover box should be placed, looking at the
    // bounding rectangle of the element and the window.
    let left = this.props.x;
    let top = this.props.y;

    if (this.props.boundRect) {
      left = this.props.boundRect.left || left;
      top = this.props.boundRect.top || top;

      if (left + MAX_WIDTH > window.innerWidth) {
        left = window.innerWidth - MAX_WIDTH - 20;
      }

      if (top < MAX_HEIGHT) {
        // The box should be at the bottom of the element
        top = this.props.boundRect.bottom;
        return { left, top };
      }
    }

    return {
      left,
      bottom: window.innerHeight - top
    };
  };

  getDisplay = () => {
    // Adding display styling for the animation to trigger
    if (this.props.x > 0) {
      return { display: "block" };
    } else {
      return { display: "none" };
    }
  };

  getStyle = () => {
    return { ...this.getPosition(), ...this.getDisplay() };
  };

  render() {
    return (
      <div className="hover-box" style={this.getStyle()}>
        <div className="title">
          {this.props.isLoading ? (
            <div className="loader-container">
              <div className="status-loader" />
            </div>
          ) : (
            <CodeNode {...this.props} showButton={false} />
          )}
        </div>
        <div className="docstring">{Docstring(this.props.docstring)}</div>
        {this.renderButtons()}
      </div>
    );
  }
}
