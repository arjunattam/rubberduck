import React from "react";
import SyntaxHighlighter from "react-syntax-highlighter";
import { github as githubStyle } from "react-syntax-highlighter/styles/hljs";
import "./SmallCodeSnippet.css";

export default class SmallCodeSnippet extends React.Component {
  getMiddleLine = content => {
    const lines = content.split("\n");
    return lines[Math.round(lines.length / 2) - 1];
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
          {this.getMiddleLine(atob(this.props.contents))}
        </SyntaxHighlighter>
      </div>
    );
  }
}
