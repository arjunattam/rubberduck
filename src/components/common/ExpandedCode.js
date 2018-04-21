import React from "react";
import Octicon from "react-component-octicons";
import SyntaxHighlight from "./SyntaxHighlight";
import { decodeBase64 } from "../../utils/data";
import { getGitService, isGithubCompareView } from "../../adapters";
import { loadUrl } from "../../components/sidebar/pjax";
import "./ExpandedCode.css";

const MAX_HEIGHT = 400; // pixels

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

  getContent = () => this.getBase64Decoded(this.props.codeSnippet || "");

  setScrollTop = () => {
    const element = document.querySelector(".expanded-content");
    const PADDING = 50;

    if (element) {
      const totalHeight = element.scrollHeight;
      const totalLines = this.getContent().split("\n").length;
      const lineDiff = this.props.lineNumber - this.props.startLineNumber;
      element.scrollTop = lineDiff * (totalHeight / totalLines) - PADDING;
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

  renderLink = (text, isBlank, onClick) => (
    <div className="expanded-button">
      <a
        href={this.props.fileLink}
        target={isBlank ? "_blank" : null}
        onClick={onClick}
      >
        {text}
      </a>
    </div>
  );

  renderNewTab = () => this.renderLink("Open file ↗", true);

  getFileboxSelector = path => {
    const service = getGitService();

    if (service === "github") {
      return `div.file-header[data-path="${path}"]`;
    } else if (service === "bitbucket") {
      return `section.iterable-item[data-path="${path}"]`;
    }
  };

  hasFileinCompareView = () => {
    return document.querySelector(this.getFileboxSelector(this.props.filePath))
      ? true
      : false;
  };

  scrollTo = () => {
    const elementSelector = this.getFileboxSelector(this.props.filePath);
    const fileBox = document.querySelector(elementSelector);
    const yOffset = window.scrollY + fileBox.getBoundingClientRect().y - 75;
    window.scrollTo(0, yOffset);
  };

  clickHandler = event => {
    const service = getGitService();
    event.preventDefault();

    switch (service) {
      case "github":
        if (isGithubCompareView()) {
          return this.scrollTo();
        } else {
          return loadUrl(this.props.fileLink);
        }
      case "bitbucket":
        return this.scrollTo();
      default:
        return;
    }
  };

  getSameTabLinkText = () => {
    const service = getGitService();

    switch (service) {
      case "github":
        if (isGithubCompareView()) {
          return "Scroll to";
        } else {
          return "Open file";
        }
      case "bitbucket":
        return "Scroll to";
      default:
        return;
    }
  };

  shouldRenderSameTab = () => {
    const service = getGitService();

    switch (service) {
      case "github":
        if (isGithubCompareView()) {
          return this.hasFileinCompareView();
        } else {
          return true;
        }
      case "bitbucket":
        return this.hasFileinCompareView();
      default:
        return;
    }
  };

  renderSameTab = () =>
    this.shouldRenderSameTab()
      ? this.renderLink(this.getSameTabLinkText(), false, event =>
          this.clickHandler(event)
        )
      : null;

  renderTitleSection = () => (
    <div className="expanded-title">
      <div className="expanded-filepath">
        <Octicon style={{ verticalAlign: "text-bottom" }} name="file" />{" "}
        <span>{this.props.filePath}</span>
      </div>
      {this.renderSameTab()}
      {this.renderNewTab()}
    </div>
  );

  getStyle = () => {
    let { top } = this.props.style;
    // This `top` could mean box is too close to the bottom of the window
    const PADDING = 75;

    if (top + MAX_HEIGHT + PADDING >= window.innerHeight) {
      top = window.innerHeight - MAX_HEIGHT - PADDING;
    }

    return { ...this.props.style, top };
  };

  render() {
    return (
      <div className="expanded-code" style={this.getStyle()}>
        {this.renderTitleSection()}
        {this.renderCode()}
      </div>
    );
  }
}
