import React from "react";
import ExpandedCode from "../common/ExpandedCode";
import SmallCodeSnippet from "../common/SmallCodeSnippet";
import CodeNode from "../common/CodeNode";

export default class ReferenceItem extends React.Component {
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
        className="reference-item"
        onMouseEnter={this.handleMouseHover}
        onMouseLeave={this.handleMouseHover}
        ref={"container"}
      >
        <CodeNode {...this.props}>
          <SmallCodeSnippet
            contents={this.props.codeSnippet}
            lineNumber={this.props.lineNumber - this.props.startLineNumber}
          />
        </CodeNode>

        {this.state.isHovering ? (
          <ExpandedCode
            language={"python"}
            codeBase64={this.props.codeSnippet}
            top={this.getTop()}
            startLine={this.props.startLineNumber}
            lineNumber={this.props.lineNumber}
            filepath={this.props.file}
          />
        ) : null}
      </div>
    );
  }
}
