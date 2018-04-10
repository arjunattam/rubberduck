import React from "react";
import Octicon from "react-component-octicons";
import "./CodeNode.css";

export default class CodeNode extends React.Component {
  render() {
    return (
      <div className="code-node-container">
        <div className="code-node-title">
          <div>
            <div className="code-node-file">
              <Octicon name="file" style={{ height: 12 }} />{" "}
              {this.props.filePath}
            </div>

            <div className="code-node-name">
              <span className="monospace">{this.props.name}</span>
            </div>
          </div>

          <div className="code-node-button">EXPAND</div>
        </div>

        {this.props.children}
      </div>
    );
  }
}
