import React from "react";
import { BaseSectionItem } from "../section";
import ExpandedCode from "../common/ExpandedCode";
import SmallCodeSnippet from "../common/SmallCodeSnippet";
import CodeNode from "../common/CodeNode";

export default class ReferenceItem extends BaseSectionItem {
  render() {
    return (
      <div
        className="reference-item"
        onMouseEnter={this.handleMouseEnter}
        onMouseLeave={this.handleMouseLeave}
        ref={"container"}
      >
        <CodeNode {...this.props}>
          <SmallCodeSnippet
            contents={this.props.codeSnippet}
            lineNumber={this.props.lineNumber - this.props.startLineNumber}
          />
        </CodeNode>

        {this.state.isHovering ? (
          <ExpandedCode {...this.props} top={this.getTop()} />
        ) : null}
      </div>
    );
  }
}
