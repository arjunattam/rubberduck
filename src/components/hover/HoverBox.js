import React from "react";
import PropTypes from "prop-types";
import Docstring from "../common/Docstring";
import HoverSignature from "./HoverSignature";
import { decodeBase64 } from "../../utils/data";
import "./Hover.css";

const MAX_HEIGHT = 240;
const MAX_WIDTH = 300;
const TOP_MARGIN = 2;

const isMac = () => navigator.platform.indexOf("Mac") >= 0;

const getMetaKey = () => (isMac() ? "⌘" : "ctrl");

function isEllipsisActive() {
  let e = document.querySelector("div.docstring.basic");
  return e ? e.offsetWidth < e.scrollWidth : "null";
}

const ExpandHelper = props => (
  <div className="expand-helper">
    <div style={{ textAlign: "left" }}>
      {`${getMetaKey()} + click `}
      <strong>{"actions"}</strong>
    </div>
    {props.isExpandable ? (
      <div style={{ textAlign: "right" }}>
        {`${getMetaKey()} `}
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

  /**
   * This decides where the hover box should be placed, looking at the
   * bounding rectangle of the element and the window.
   */
  getPosition = () => {
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
    const { name, docstring } = this.props.apiResult;
    return name || docstring ? true : false;
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

  isDocstringExpandable = () => {
    const { docstring } = this.props.apiResult;
    const { isHighlighted } = this.props;
    const decodedData = decodeBase64(docstring || "");
    // The length for expandable depends on the width of the box
    const isLong = decodedData.indexOf("\n") >= 0 || decodedData.length > 40;
    return docstring && isLong && !isHighlighted;
  };

  render() {
    const isExpandable = this.isDocstringExpandable();
    const { isVisible, isHighlighted } = this.props;
    const hoverBox = (
      <div className="hover-box" style={this.getStyle()}>
        <ExpandHelper isExpandable={isExpandable} />
        {isHighlighted ? this.renderExpanded() : this.renderBasic()}
        {this.renderSignature()}
      </div>
    );
    return isVisible ? hoverBox : null;
  }
}
