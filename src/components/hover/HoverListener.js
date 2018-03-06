import React from "react";
import { connect } from "react-redux";
import { listener as blobListener } from "../../adapters/github/views/blob";
import { listener as pullListener } from "../../adapters/github/views/pull";
import HoverElement from "./HoverElement";
import * as GitPathAdapter from "../../adapters/github/path";

class HoverListener extends React.Component {
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

  componentDidUpdate(prevProps, prevState) {
    const isSameSessionPath = GitPathAdapter.isSameSessionPath(
      prevProps.data.repoDetails,
      this.props.data.repoDetails
    );
    const hasChangedPath = GitPathAdapter.hasChangedPath(
      prevProps.data.repoDetails,
      this.props.data.repoDetails
    );
    if (!isSameSessionPath || hasChangedPath) {
      this.setupListener();
    }
  }

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
      listener(e, this.receiver, this.props.data.repoDetails.branch);
      this.setState({
        currentMouseX: e.x,
        currentMouseY: e.y
      });
    }
  }

  setupListener = () => {
    const isFileView = window.location.href.indexOf("blob") >= 0;
    const isPRView = window.location.href.indexOf("pull") >= 0;
    const isCommitView = window.location.href.indexOf("commit") >= 0;
    const isCompareView = window.location.href.indexOf("compare") >= 0;
    let listener = null;

    if (isFileView) {
      listener = blobListener;
    } else if (isPRView || isCommitView || isCompareView) {
      listener = pullListener;
    }

    if (listener !== null) {
      document.body.onmouseover = null;
      document.body.onmouseover = e => {
        this.onMouseOverListener(e, listener);
      };
    } else {
      document.body.onmouseover = null;
    }
  };

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

function mapStateToProps(state) {
  const { storage, data } = state;
  return {
    storage,
    data
  };
}
export default connect(mapStateToProps)(HoverListener);
