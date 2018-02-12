import React from "react";
import Octicon from "react-component-octicons";
import "./CodeNode.css";

export default class CodeNode extends React.Component {
  render() {
    return (
      <div>
        <div className="code-node-file">
          <Octicon name="file" style={{ height: 12 }} /> {this.props.file}
        </div>

        <div className="code-node-name">
          <span className="monospace">{this.props.name}</span>
        </div>

        {this.props.children}

        <div className="code-node-button">Browse code </div>
      </div>
    );
  }
}
