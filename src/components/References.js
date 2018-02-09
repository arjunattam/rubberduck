import React from "react";
import PropTypes from "prop-types";
import "./Tree.css";
import { listener as blobListener } from "./../adapters/github/views/blob";
import { listener as pullListener } from "./../adapters/github/views/pull";

class ReferenceItem extends React.Component {
  static propTypes = {
    elementText: PropTypes.string,
    lineNumber: PropTypes.number,
    charNumber: PropTypes.number,
    filePath: PropTypes.string,
    fileSha: PropTypes.string
  };

  render() {
    return (
      <div className="reference-item">
        <p>{this.props.elementText}</p>
        <p>{this.props.lineNumber + " " + this.props.charNumber}</p>
        <p>{this.props.filePath}</p>
        <p>{this.props.fileSha}</p>
      </div>
    );
  }
}

export default class References extends React.Component {
  state = {
    isVisible: false
  };

  receiver = result => {
    // Callback for the hover listener
    this.setState(result);
  };

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
      const that = this;
      document.body.onmouseover = e => {
        listener(e, that.receiver);
      };
    } else {
      document.body.onmouseover = null;
    }
  };

  componentDidMount() {
    this.setupListener();
  }

  toggleVisibility = () => {
    this.setState({
      isVisible: !this.state.isVisible
    });
  };

  render() {
    if (this.state.isVisible) {
      return (
        <div className="hover-result">
          <div className="tree-header" onClick={this.toggleVisibility}>
            ▼ References
          </div>
          <ReferenceItem {...this.state} />
        </div>
      );
    } else {
      return (
        <div className="hover-result">
          <div className="tree-header" onClick={this.toggleVisibility}>
            ▷ References
          </div>
        </div>
      );
    }
  }
}
