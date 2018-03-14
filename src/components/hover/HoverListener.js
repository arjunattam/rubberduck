import React from "react";
import { connect } from "react-redux";
import { bindActionCreators } from "redux";
import * as DataActions from "../../actions/dataActions";
import { getListener } from "../../adapters/github/views/helper";
import HoverElement from "./HoverElement";
import * as GitPathAdapter from "../../adapters/github/path";

class HoverListener extends React.Component {
  // Sets up a mouse over event to read the page
  constructor(props) {
    super(props);
    this.DataActions = bindActionCreators(DataActions, this.props.dispatch);
  }

  state = {
    mouseX: -1000,
    mouseY: -1000,
    hoverResult: {}
  };

  triggerAction = (actionName, coordinates) => {
    this.DataActions.updateData({
      openSection: actionName,
      textSelection: coordinates
    });
  };

  onReferences = coordinates => {
    this.triggerAction("references", coordinates);
  };

  onDefinition = coordinates => {
    this.triggerAction("definitions", coordinates);
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
    const listener = getListener();

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
        onReferences={coordinates => this.onReferences(coordinates)}
        onDefinition={coordinates => this.onDefinition(coordinates)}
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
