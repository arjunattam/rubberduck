import React from "react";
import { connect } from "react-redux";
import { bindActionCreators } from "redux";
import * as DataActions from "../../actions/dataActions";
import { getPageListener, pathAdapter } from "../../adapters/";
import HoverElement from "./HoverElement";

class HoverListener extends React.Component {
  // Sets up a mouse over event to read the page
  constructor(props) {
    super(props);
    this.DataActions = bindActionCreators(DataActions, this.props.dispatch);
  }

  state = {
    hoverResult: {}
  };

  isValidResult = () => {
    const { lineNumber, charNumber } = this.state.hoverResult;
    // we are relying on the fact that undefined >= 0 gives false
    return lineNumber >= 0 && charNumber >= 0;
  };

  callActions = () => {
    if (!this.isValidResult()) return;
    this.DataActions.updateData({
      hoverResult: this.state.hoverResult
    });
  };

  receiver = hoverResult => {
    this.setState({ hoverResult });
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

  render() {
    const { hasHoverDebug } = this.props.storage;

    return (
      <div>
        <HoverElement {...this.state} callActions={() => this.callActions()} />
        {hasHoverDebug ? this.renderDebugger() : null}
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
