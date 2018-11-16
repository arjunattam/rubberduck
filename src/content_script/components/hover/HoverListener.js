import React from "react";
import { connect } from "react-redux";
import { getPageListener, pathAdapter } from "../../adapters/";
import HoverElement from "./HoverElement";

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
      const PADDING = 20; // For the mouse to hover inside the box comfortably

      return (
        rect.x <= x &&
        x <= rect.x + rect.width &&
        rect.y - PADDING <= y &&
        y <= rect.y + rect.height + PADDING
      );
    }
  };

  onMouseOverListener(e, listener) {
    if (!this.isOnHoverBox(e.x, e.y)) {
      listener(e, this.receiver, this.props.data.repoDetails.branch);
    } else {
      this.setState({ isOnHoverBox: true });
    }
  }

  setupListeners = () => {
    this.listener = getPageListener();

    if (this.listener !== null) {
      document.body.onmousemove = null;
      document.body.onmousemove = e => {
        this.onMouseOverListener(e, this.listener);
      };
    } else {
      document.body.onmousemove = null;
    }
  };

  componentWillUnmount() {
    document.body.onmousemove = null;
  }

  renderDebugger = () => {
    const entries = Object.entries(this.state.hoverResult);
    const liElements = entries.map(tuple => {
      let value = "";
      if (tuple.length > 1 && tuple[1]) {
        value = tuple[1].outerHTML ? tuple[1].outerHTML : tuple[1];
      }

      return (
        <li key={tuple[0]}>
          <strong>{tuple[0]}</strong> {value}
        </li>
      );
    });

    return (
      <div className="hover-debugger">
        <ul>{liElements}</ul>
      </div>
    );
  };

  isDebugging = () => {
    const { hasHoverDebug } = this.props.storage;
    // Can never debug in production
    return hasHoverDebug && process.env.REACT_APP_BACKEND_ENV === "local";
  };

  render() {
    return (
      <div>
        <HoverElement {...this.props} {...this.state} />
        {this.isDebugging() ? this.renderDebugger() : null}
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
