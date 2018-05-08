import React from "react";
import { BaseSectionItem } from "../section";
import SmallCodeSnippet from "../common/SmallCodeSnippet";

export default class ReferenceItem extends BaseSectionItem {
  render() {
    return (
      <div
        className="reference-item"
        onMouseEnter={this.handleMouseEnter}
        onMouseLeave={this.handleMouseLeave}
        ref={"container"}
      >
        <SmallCodeSnippet
          contents={this.props.codeSnippet}
          contentLine={this.props.lineNumber - this.props.startLineNumber}
          lineNumber={this.props.lineNumber}
        />
        {this.renderExpandedCode()}
      </div>
    );
  }
}
