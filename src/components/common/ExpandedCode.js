import React from "react";
import Octicon from "react-component-octicons";
import SyntaxHighlight from "./SyntaxHighlight";
import { decodeBase64 } from "../../utils/data";
import "./ExpandedCode.css";

export default class ExpandedCode extends React.Component {
  // Line numbers are zero-indexed in the API, so we need to +1
  // for display.
  getBase64Decoded(encodedString) {
    let decoded = "";
    try {
      decoded = decodeBase64(encodedString);
    } catch (e) {}
    return decoded;
  }

  getHighligtedLineStyle(lineNo) {
    let highlightedLineNo;
    if (this.props.lineNumber >= 0 && this.props.startLineNumber >= 0) {
      highlightedLineNo =
        this.props.lineNumber - this.props.startLineNumber + 1;
    }
    if (highlightedLineNo && highlightedLineNo === lineNo) {
      return {
        backgroundColor: "#FFFBE0"
      };
    }
    return {};
  }

  getLanguage = () => {
    if (this.props.filePath) {
      const splitPath = this.props.filePath.split(".");

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
          case "go":
            return "go";
          default:
            return null;
        }
      }
    }
  };

  getContent = () => this.getBase64Decoded(this.props.codeSnippet || "");

  setScrollTop = () => {
    const element = document.querySelector(".expanded-content");

    if (element) {
      const totalHeight = element.scrollHeight;
      const totalLines = this.getContent().split("\n").length;
      element.scrollTop =
        (this.props.lineNumber - this.props.startingLineNumber) *
        (totalHeight / totalLines);
    }
  };

  componentDidMount() {
    this.setScrollTop();
  }

  renderCode = () => (
    <div className="expanded-content">
      <SyntaxHighlight
        children={this.getContent()}
        language={this.getLanguage()}
        showLineNumbers={true}
        startingLineNumber={this.props.startLineNumber + 1}
        lineStyle={lineNo => {
          return this.getHighligtedLineStyle(lineNo);
        }}
      />
    </div>
  );

  renderLink = () => (
    <div className="expanded-button">
      <a href={this.props.fileLink} target="_blank">
        Open file ↗
      </a>
    </div>
  );

  renderTitleSection = () => (
    <div className="expanded-title">
      <div className="expanded-filepath">
        <Octicon name="file" /> {this.props.filePath}
      </div>
      {this.renderLink()}
    </div>
  );

  render() {
    return (
      <div className="expanded-code" style={this.props.style}>
        {this.renderTitleSection()}
        {this.renderCode()}
      </div>
    );
  }
}
