import React from "react";
import PropTypes from "prop-types";
import SyntaxHighlight from "../common/SyntaxHighlight";
import { decodeBase64 } from "../../utils/data";

const PADDING = 50;

export default class Codebox extends React.Component {
  static propTypes = {
    lineNumbers: PropTypes.array.isRequired,
    startLineNumber: PropTypes.number.isRequired,
    currentLineNumber: PropTypes.number.isRequired,
    filePath: PropTypes.string.isRequired,
    codeSnippet: PropTypes.string.isRequired
  };

  componentDidUpdate(prevProps, prevState) {
    const { currentLineNumber, codeSnippet } = this.props;
    const didChangeLine = prevProps.currentLineNumber !== currentLineNumber;
    const didChangeContents = prevProps.codeSnippet !== codeSnippet;
    if (didChangeContents || didChangeLine) {
      this.scrollTo(this.props.currentLineNumber);
    }
  }

  componentDidMount() {
    this.scrollTo(this.props.currentLineNumber);
  }

  getContent = () => this.getBase64Decoded(this.props.codeSnippet || "");

  scrollTo = lineNumber => {
    const element = document.querySelector(".expanded-content");

    if (element) {
      const totalHeight = element.scrollHeight;
      const totalLines = this.getContent().split("\n").length;
      const lineDiff = lineNumber - this.props.startLineNumber;
      element.scrollTop = lineDiff * (totalHeight / totalLines) - PADDING;
    }
  };

  getBase64Decoded(encodedString) {
    let decoded = "";
    try {
      decoded = decodeBase64(encodedString);
    } catch (e) {}
    return decoded;
  }

  getHighligtedLineStyle(lineNo) {
    return this.props.lineNumbers.indexOf(lineNo - 1) >= 0
      ? {
          backgroundColor: "#FFFBE0"
        }
      : {};
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
          case "jsx": // unfortunately this doesn't work that well
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

  render() {
    return (
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
  }
}
