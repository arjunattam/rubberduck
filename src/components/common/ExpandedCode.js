import React from "react";
import SyntaxHighlighter from "react-syntax-highlighter";
import { githubGist as githubStyle } from "react-syntax-highlighter/styles/hljs";
import Octicon from "react-component-octicons";
import "./ExpandedCode.css";

export default class ExpandedCode extends React.Component {
  // Line numbers are zero-indexed in the API, so we need to +1
  // for display.
  getBase64Decoded(encodedString) {
    let decoded = "";
    try {
      decoded = atob(encodedString);
    } catch (e) {
      decoded = "";
    }
    return decoded;
  }

  getHighligtedLineStyle(lineNo) {
    let highlightedLineNo;
    if (this.props.lineNumber >= 0 && this.props.startLine >= 0) {
      highlightedLineNo = this.props.lineNumber - this.props.startLine + 1;
    }
    if (highlightedLineNo && highlightedLineNo === lineNo) {
      return {
        backgroundColor: "#FFFBE0"
      };
    }
    return {};
  }

  render() {
    let decodedCode = this.getBase64Decoded(this.props.codeBase64);
    return (
      <div className="expanded-code" style={{ top: this.props.top }}>
        <div className="expanded-title">
          <div className="expanded-filepath">
            <Octicon name="file" /> {this.props.filepath}
          </div>
          <div className="expanded-button">
            <a href={this.props.filepath} target="_blank">
              Open file ↗
            </a>
          </div>
        </div>
        <div className="expanded-content">
          <SyntaxHighlighter
            language={this.props.language}
            style={githubStyle}
            showLineNumbers={true}
            startingLineNumber={this.props.startLine + 1}
            lineNumberStyle={{ color: "rgba(27,31,35,0.3)" }}
            wrapLines={true}
            lineStyle={lineNo => {
              return this.getHighligtedLineStyle(lineNo);
            }}
          >
            {decodedCode}
          </SyntaxHighlighter>
        </div>
      </div>
    );
  }
}
