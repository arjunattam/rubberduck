import React from "react";
import { connect } from "react-redux";
import { bindActionCreators } from "redux";
import * as DataActions from "../../actions/dataActions";
import { getPageListener } from "../../adapters/";
import HoverElement from "./HoverElement";
import { pathAdapter } from "../../adapters";

class HoverListener extends React.Component {
  // Sets up a mouse over event to read the page
  constructor(props) {
    super(props);
    this.DataActions = bindActionCreators(DataActions, this.props.dispatch);
  }

  state = {
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
        hoverResult: hoverResult
      });
    } else {
      this.setState({ hoverResult: {} });
    }
  };

  componentDidUpdate(prevProps, prevState) {
    const isSameSessionPath = pathAdapter.isSameSessionPath(
      prevProps.data.repoDetails,
      this.props.data.repoDetails
    );
    const hasChangedPath = pathAdapter.hasChangedPath(
      prevProps.data.repoDetails,
      this.props.data.repoDetails
    );
    if (!isSameSessionPath || hasChangedPath || !this.listener) {
      this.setupListeners();
    }
  }

  isOnHoverBox = (x, y) => {
    const hoverElement = document.querySelector(".hover-box");

    if (hoverElement) {
      const rect = hoverElement.getBoundingClientRect();
      const padding = 15; // For the mouse to hover inside the box comfortably

      return (
        rect.x <= x &&
        x <= rect.x + rect.width &&
        rect.y - padding <= y &&
        y <= rect.y + rect.height + padding
      );
    }
  };

  onMouseOverListener(e, listener) {
    if (!this.isOnHoverBox(e.x, e.y)) {
      listener(e, this.receiver, this.props.data.repoDetails.branch);
    }
  }

  setupListeners = () => {
    // There are two listeners: one to fill up spans in code elements, other
    // to listen for those spans.
    this.setupCodeboxListener();
    this.setupSpanListener();
  };

  setupCodeboxListener = () => {};

  setupSpanListener = () => {
    this.listener = getPageListener();

    if (this.listener !== null) {
      document.body.onmouseover = null;
      document.body.onmouseover = e => {
        this.onMouseOverListener(e, this.listener);
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
        {...this.state}
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
