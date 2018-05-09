import React from "react";
import SyntaxHighlight from "./SyntaxHighlight";
import "./SmallCodeSnippet.css";
import { decodeBase64 } from "../../utils/data";

export default class SmallCodeSnippet extends React.Component {
  getMiddleLine = content => {
    const lines = content.split("\n");
    let line = lines[this.props.contentLine];
    return line ? line : "";
  };

  render() {
    return (
      <div className="small-code">
        <SyntaxHighlight
          showLineNumbers={true}
          startingLineNumber={this.props.lineNumber + 1}
          language={this.props.language}
          children={this.getMiddleLine(decodeBase64(this.props.contents))}
        />
      </div>
    );
  }
}
