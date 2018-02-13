import React from "react";
import SyntaxHighlighter from "react-syntax-highlighter";
import { githubGist as githubStyle } from "react-syntax-highlighter/styles/hljs";
import Octicon from "react-component-octicons";
import "./ExpandedCode.css";

export default class ExpandedCode extends React.Component {
  render() {
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
            startingLineNumber={this.props.startLine}
            lineNumberStyle={{ color: "rgba(27,31,35,0.3)" }}
          >
            {atob(this.props.codeBase64)}
          </SyntaxHighlighter>
        </div>
      </div>
    );
  }
}
