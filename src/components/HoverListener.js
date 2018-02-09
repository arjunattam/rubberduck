import React from "react";
import "./HoverListener.css";
import { listener as blobListener } from "./../adapters/github/views/blob";
import { listener as pullListener } from "./../adapters/github/views/pull";

export default class HoverListener extends React.Component {
  state = {
    text: "default",
    file: "file",
    line: "line",
    char: "char",
    sha: "none"
  };

  receiver = result => {
    // Callback for the hover listener
    this.setState({
      text: result.elementText,
      file: result.filePath,
      sha: result.fileSha,
      line: result.lineNumber,
      char: result.charNumber
    });
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

  render() {
    return (
      <div class="hover-result">
        <p>{this.state.text}</p>
        <p>{this.state.file}</p>
        <p>{this.state.line}</p>
        <p>{this.state.char}</p>
        <p>{this.state.sha}</p>
      </div>
    );
  }
}
