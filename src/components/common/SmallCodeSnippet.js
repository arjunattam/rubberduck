import React from "react";
import SyntaxHighlight from "./SyntaxHighlight";
import "./SmallCodeSnippet.css";
import { decodeBase64 } from "../../utils/data";

export default class SmallCodeSnippet extends React.Component {
  getMiddleLine = content => {
    const lines = content.split("\n");
    let line = "";

    if (this.props.lineNumber !== null) {
      line = lines[this.props.lineNumber];
    } else {
      line = lines[Math.round(lines.length / 2) - 1];
    }

    if (line !== undefined) {
      return line;
    } else {
      return "";
    }
  };

  render() {
    return (
      <div className="small-code">
        <SyntaxHighlight
          language={this.props.language}
          children={this.getMiddleLine(decodeBase64(this.props.contents))}
        />
      </div>
    );
  }
}
