import React from "react";
import PropTypes from "prop-types";
import Docstring from "../common/Docstring";
import HoverSignature from "./HoverSignature";
import "./Hover.css";

const MAX_HEIGHT = 240;
const MAX_WIDTH = 300;
const TOP_MARGIN = 4;

const ExpandHelper = props => (
  <div className="expand-helper">
    <div style={{ textAlign: "left" }}>
      {"⌘ + click "}
      <strong>{"actions"}</strong>
    </div>
    {props.isExpandable ? (
      <div style={{ textAlign: "right" }}>
        {"⌘ "}
        <strong>{"expand"}</strong>
      </div>
    ) : null}
  </div>
);

export default class HoverBox extends React.Component {
  static propTypes = {
    apiResult: PropTypes.object,
    hoverResult: PropTypes.object,
    isVisible: PropTypes.bool,
    isLoading: PropTypes.bool,
    isHighlighted: PropTypes.bool
  };

  isVisibleToUser = () => this.props.hoverResult.mouseX > 0;

  getPosition = () => {
    // This decides where the hover box should be placed, looking at the
    // bounding rectangle of the element and the window.
    const { mouseX, mouseY, element } = this.props.hoverResult;
    let left = mouseX || -1000;
    let top = mouseY || -1000;

    if (element && element.getBoundingClientRect) {
      const boundRect = element.getBoundingClientRect();
      left = boundRect.left || left;
      top = boundRect.top || top;

      if (left + MAX_WIDTH > window.innerWidth) {
        left = window.innerWidth - MAX_WIDTH - 20;
      }

      if (top < MAX_HEIGHT) {
        // The box should be at the bottom of the element
        top = boundRect.bottom + TOP_MARGIN;
        return { left, top };
      }
    }

    return {
      left,
      bottom: window.innerHeight - top + TOP_MARGIN
    };
  };

  getDisplay = () => {
    if (this.isVisibleToUser()) {
      // Adding display styling for the opacity animation to trigger
      return { display: "block" };
    } else {
      return { display: "none" };
    }
  };

  hasHoverResponse = () => {
    return this.props.apiResult.name ? true : false;
  };

  getStyle = () => {
    const width = this.hasHoverResponse() ? 275 : 150;
    return {
      ...this.getPosition(),
      ...this.getDisplay(),
      width
    };
  };

  renderSignature() {
    const { name, signature, language } = this.props.apiResult;
    return this.hasHoverResponse() ? (
      <div className="signature monospace">
        <HoverSignature
          language={language || ""}
          signature={signature || name || ""}
        />
      </div>
    ) : null;
  }

  renderDocstring = className => {
    const { docstring } = this.props.apiResult;
    return docstring ? (
      <div className={`docstring ${className}`}>
        <Docstring docstring={docstring} />
      </div>
    ) : null;
  };

  renderBasic = () => this.renderDocstring("basic");

  renderExpanded = () => this.renderDocstring("expanded");

  render() {
    const isExpandable = this.props.apiResult.docstring ? true : false;

    return this.props.isVisible ? (
      <div className="hover-box" style={this.getStyle()}>
        <ExpandHelper isExpandable={isExpandable} />
        {this.props.isHighlighted ? this.renderExpanded() : this.renderBasic()}
        {this.renderSignature()}
      </div>
    ) : null;
  }
}
