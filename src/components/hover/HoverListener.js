import React from "react";
import { listener as blobListener } from "../../adapters/github/views/blob";
import { listener as pullListener } from "../../adapters/github/views/pull";
import HoverElement from "./HoverElement";

export default class HoverListener extends React.Component {
  // Sets up a mouse over event to read the page
  state = {
    mouseX: -1000,
    mouseY: -1000,
    hoverResult: {}
  };

  receiver = hoverResult => {
    // Callback for the hover listener. API call is made if the
    // mouse locations were correctly infered by the view adapter,
    // and there is text below the mouse.
    const hasValidMouseLocation =
      hoverResult.hasOwnProperty("fileSha") &&
      hoverResult.hasOwnProperty("lineNumber");

    if (hasValidMouseLocation) {
      // Show hover box, and make API call
      this.setState({
        mouseX: hoverResult.mouseX,
        mouseY: hoverResult.mouseY,
        hoverResult: hoverResult
      });
    } else {
      this.setState({ mouseX: -1000, mouseY: -1000 });
    }
  };

  filterForHoverBox = (x, y) => {
    // Return true if x and y lie inside the hover box
    // We will not remove the hover box if that is the case
    const elements = document.getElementsByClassName("hover-box");

    if (elements.length > 0) {
      const hoverElement = elements[0];
      const rect = hoverElement.getBoundingClientRect();
      const padding = 10;

      return (
        rect.x - padding <= x &&
        x <= rect.x + rect.width + padding &&
        rect.y - padding <= y &&
        y <= rect.y + rect.height + padding
      );
    }
  };

  onMouseOverListener(e, listener) {
    if (!this.filterForHoverBox(e.x, e.y)) {
      listener(e, this.receiver);
      this.setState({
        currentMouseX: e.x,
        currentMouseY: e.y
      });
    }
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
    return (
      <HoverElement
        mouseX={this.state.mouseX}
        mouseY={this.state.mouseY}
        hoverResult={this.state.hoverResult}
      />
    );
  }
}
