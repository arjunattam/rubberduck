import React from "react";
import Octicon from "react-component-octicons";
import "./CodeNode.css";

export default class CodeNode extends React.Component {
  getStyle = () => ({ width: this.props.sidebarWidth - 90 });

  render() {
    return (
      <div className="code-node-container">
        <div className="code-node-title">
          <div style={this.getStyle()}>
            <div className="code-node-file">
              <Octicon name="file" style={{ height: 12 }} />{" "}
              {this.props.filePath}
            </div>

            <div className="code-node-name">
              <span className="monospace">{this.props.name}</span>
            </div>
          </div>
        </div>

        {this.props.children}
      </div>
    );
  }
}
