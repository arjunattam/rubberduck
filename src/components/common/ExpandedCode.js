import React from "react";
import SyntaxHighlighter from "react-syntax-highlighter";
import { githubGist as githubStyle } from "react-syntax-highlighter/styles/hljs";
import Octicon from "react-component-octicons";
import "./ExpandedCode.css";
import { decodeBase64 } from "../../utils/data";

export default class ExpandedCode extends React.Component {
  // Line numbers are zero-indexed in the API, so we need to +1
  // for display.
  getBase64Decoded(encodedString) {
    let decoded = "";
    try {
      decoded = decodeBase64(encodedString);
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

  getLanguage = () => {
    if (this.props.filepath) {
      const splitPath = this.props.filepath.split(".");

      if (splitPath.length > 0) {
        const ext = splitPath[splitPath.length - 1];

        switch (ext) {
          case "py":
            return "python";
          case "js":
            return "javascript";
          case "ts":
            return "typescript";
          case "java":
            return "java";
          default:
            return null;
        }
      }
    }
  };

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
            language={this.getLanguage()}
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
