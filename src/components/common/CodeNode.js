import React from "react";
import Octicon from "react-component-octicons";
import "./CodeNode.css";

export default class CodeNode extends React.Component {
  render() {
    const showButton =
      this.props.showButton === undefined || this.props.showButton;

    return (
      <div className="code-node-container">
        <div className="code-node-file">
          <Octicon name="file" style={{ height: 12 }} /> {this.props.file}
        </div>

        <div className="code-node-name">
          <span className="monospace">{this.props.name}</span>
        </div>

        {this.props.children}

        {showButton ? (
          <div className="code-node-button">Expand code</div>
        ) : null}
      </div>
    );
  }
}
