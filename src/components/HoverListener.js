import React from "react";
import "./HoverListener.css";

export default class HoverListener extends React.Component {
  state = {
    text: "default",
    file: "file",
    line: "line",
    char: "char"
  };

  getFileUri = node => {
    const uri = node.parentNode.baseURI;
    return uri
      .replace("#", "")
      .split("master")[1]
      .slice(1);
  };

  getLine = node => {
    const nodeId = node.id;
    const parentNodeId = node.parentNode.id;
    // One of these two needs to look like LC12
    if (nodeId.indexOf("LC") >= 0) {
      return +nodeId.replace("LC", "") - 1; // for 0-indexed
    } else if (parentNodeId.indexOf("LC") >= 0) {
      return +parentNodeId.replace("LC", "") - 1; // for 0-indexed
    } else {
      return -1;
    }
  };

  stripPx = value => {
    // Get `12px` and return `12`
    return +value.replace("px", "");
  };

  getChar = (node, mouseX) => {
    let element = node;
    if (node.id.indexOf("LC") < 0) {
      // node or parentNode is the relevant `td` element we need
      if (node.parentNode.id.indexOf("LC") >= 0) {
        element = node.parentNode;
      } else {
        return -1;
      }
    }

    const bbox = element.getBoundingClientRect();
    const elStyle = window.getComputedStyle(element);
    const charInPixels = mouseX - bbox.x - this.stripPx(elStyle.paddingLeft);
    const lineHeight = this.stripPx(elStyle.fontSize);
    const fontAspectRatio = 0.6; // aspect ratio (w/h) for SF-Mono font
    return Math.round(charInPixels / (fontAspectRatio * lineHeight));
  };

  parseCommonAncestor = (element, x, y) => {
    const node = element.parentNode;
    this.setState({
      text: element.nodeValue,
      file: this.getFileUri(node),
      line: this.getLine(node),
      char: this.getChar(node, x)
    });
  };

  setupListener = () => {
    document.body.onmouseover = e => {
      const range = document.caretRangeFromPoint(e.x, e.y);
      this.parseCommonAncestor(range.commonAncestorContainer, e.x, e.y);
    };
  };

  componentDidMount() {
    this.setupListener();
  }

  render() {
    return (
      <div class="hover-result">
        <p>{this.state.text}</p>
        <p>{this.state.file}</p>
        <p>{this.state.line}</p>
        <p>{this.state.char}</p>
      </div>
    );
  }
}
