import React from "react";
import SyntaxHighlighter from "react-syntax-highlighter";
import { github as githubStyle } from "react-syntax-highlighter/styles/hljs";
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
        <SyntaxHighlighter
          language={this.props.language}
          style={githubStyle}
          wrapLines={true}
          lineStyle={lineNumber => {
            let style = { display: "block", width: 220 };
            return style;
          }}
        >
          {this.getMiddleLine(decodeBase64(this.props.contents))}
        </SyntaxHighlighter>
      </div>
    );
  }
}
