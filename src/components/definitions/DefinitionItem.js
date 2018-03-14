import ExpandedCode from "../common/ExpandedCode";
import CodeNode from "../common/CodeNode";
import Docstring from "../common/Docstring";

import React from "react";

export default class DefinitionItem extends React.Component {
  state = {
    isHovering: false
  };

  handleMouseHover = () => {
    this.setState({
      isHovering: !this.state.isHovering
    });
  };

  getTop = () => {
    return this.refs.container.getBoundingClientRect().top;
  };

  render() {
    return (
      <div
        className="definition-item"
        onMouseEnter={this.handleMouseHover}
        onMouseLeave={this.handleMouseHover}
        ref={"container"}
      >
        <CodeNode name={this.props.name} file={this.props.filePath}>
          <div className="definition-docstring">
            {this.props.docstring
              ? Docstring(this.props.docstring)
              : "docstring goes here"}
          </div>
        </CodeNode>

        {this.state.isHovering ? (
          <ExpandedCode
            language={"python"}
            codeBase64={this.props.codeSnippet}
            top={this.getTop()}
            startLine={this.props.startLineNumber}
            lineNumber={this.props.lineNumber}
            filepath={this.props.filePath}
          />
        ) : null}
      </div>
    );
  }
}
