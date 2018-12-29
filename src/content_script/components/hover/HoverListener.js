import React from "react";
import { connect } from "react-redux";
import { getPageListener } from "../../adapters/";
import pathAdapter from "../../adaptersv2";
import HoverElement from "./HoverElement";
import { HoverDebugger } from "./HoverDebug";

/**
 * This component sets up the mouse event listeners.
 */
class HoverListener extends React.Component {
  state = {
    hoverResult: {}
  };

  receiver = hoverResult => {
    this.setState({ hoverResult, isOnHoverBox: false });
  };

  componentDidMount() {
    this.setupListeners();
  }

  componentDidUpdate(prevProps, prevState) {
    const hasChangedView = pathAdapter.hasViewChanged(
      prevProps.data.view,
      this.props.data.view
    );
    const hasChangedPath = pathAdapter.hasPathChanged(
      prevProps.data.view,
      this.props.data.view
    );

    if (hasChangedView || hasChangedPath || !this.listener) {
      this.setupListeners();
    }
  }

  isOnHoverBox = (x, y) => {
    const hoverElement = document.querySelector(".hover-box");

    if (hoverElement) {
      const rect = hoverElement.getBoundingClientRect();
      const PADDING = 20; // For the mouse to hover inside the box comfortably

      return (
        rect.x <= x &&
        x <= rect.x + rect.width &&
        rect.y - PADDING <= y &&
        y <= rect.y + rect.height + PADDING
      );
    }
  };

  onMouseOverListener(event, listener) {
    if (!this.isOnHoverBox(event.x, event.y)) {
      listener(event, this.receiver, this.props.data.repoDetails.branch);
    } else {
      this.setState({ isOnHoverBox: true });
    }
  }

  setupListeners = () => {
    this.listener = getPageListener();

    if (this.listener !== null) {
      document.body.onmousemove = null;
      document.body.onmousemove = event => {
        this.onMouseOverListener(event, this.listener);
      };
    } else {
      document.body.onmousemove = null;
    }
  };

  componentWillUnmount() {
    document.body.onmousemove = null;
  }

  isDebugging = () => {
    const { hasHoverDebug } = this.props.storage;
    return hasHoverDebug;
  };

  render() {
    const isDebugging = this.isDebugging();

    return (
      <div>
        <HoverElement {...this.props} {...this.state} />

        {isDebugging ? (
          <HoverDebugger hoverResult={this.state.hoverResult} />
        ) : null}
      </div>
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
