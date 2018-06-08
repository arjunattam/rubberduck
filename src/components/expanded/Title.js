import React from "react";
import PropTypes from "prop-types";
import Octicon from "react-component-octicons";
import InlineButton from "../common/InlineButton";
import { getGitService, isGithubCompareView } from "../../adapters";
import { loadUrl } from "../sidebar/pjax";

const appendLineNumber = (baseLink, lineNumber) => {
  switch (getGitService()) {
    case "github":
      return `${baseLink}#L${lineNumber + 1}`;
    case "bitbucket":
      return `${baseLink}#lines-${lineNumber + 1}`;
    default:
      return baseLink;
  }
};

export default class Title extends React.Component {
  static propTypes = {
    filePath: PropTypes.string.isRequired,
    baseLink: PropTypes.string.isRequired,
    currentLineNumber: PropTypes.number.isRequired
  };

  getFileLink = () =>
    appendLineNumber(this.props.baseLink, this.props.currentLineNumber);

  hasFileinCompareView = () => {
    return document.querySelector(this.getFileboxSelector(this.props.filePath))
      ? true
      : false;
  };

  getFileboxSelector = path => {
    const service = getGitService();

    if (service === "github") {
      return `div.file-header[data-path="${path}"]`;
    } else if (service === "bitbucket") {
      return `section.iterable-item[data-path="${path}"]`;
    }
  };

  scrollToDOMSelector = elementSelector => {
    const element = document.querySelector(elementSelector);
    const yOffset = window.scrollY + element.getBoundingClientRect().y - 75;
    window.scrollTo(0, yOffset);
  };

  scrollTo = () => {
    const elementSelector = this.getFileboxSelector(this.props.filePath);
    return this.scrollToDOMSelector(elementSelector);
  };

  removeExistingHighlights = () => {
    const highlightedElements = document.querySelectorAll(
      "td.blob-code.highlighted"
    );

    for (let i = 0; i < highlightedElements.length; ++i) {
      highlightedElements[i].classList.remove("highlighted");
    }
  };

  highlightLine = lineId => {
    this.removeExistingHighlights();
    const siblingId = `LC${lineId.substr(1)}`; // lineId is L35
    const tdElement = document.querySelector(`td#${siblingId}`);
    tdElement.classList.add("highlighted");
  };

  getLineId = () => `L${this.props.currentLineNumber + 1}`;

  scrollToLine = () => {
    const lineId = this.getLineId();
    this.highlightLine(lineId);
    return this.scrollToDOMSelector(`td#${lineId}`);
  };

  clickHandler = event => {
    const service = getGitService();
    event.preventDefault();

    switch (service) {
      case "github":
        if (isGithubCompareView()) {
          return this.scrollTo();
        } else if (this.isFileAlreadyOpen()) {
          // File is open, scroll to line
          return this.scrollToLine();
        } else {
          // Load the url, callback to highlight line
          return loadUrl(this.getFileLink(), () =>
            this.highlightLine(this.getLineId())
          );
        }
      case "bitbucket":
        return this.scrollTo();
      default:
        return;
    }
  };

  isFileAlreadyOpen = () =>
    window.location.pathname.indexOf(this.props.filePath) >= 0;

  getSameTabLinkText = () => {
    const service = getGitService();

    switch (service) {
      case "github":
        if (isGithubCompareView() || this.isFileAlreadyOpen()) {
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

  renderNewTab = () =>
    this.renderLink("Open file", true, null, "link-external");

  renderLink = (text, isBlank, onClick, icon) => (
    <InlineButton
      href={this.getFileLink()}
      style={{ marginLeft: 5 }}
      {...{ isBlank, onClick, text, icon }}
    />
  );

  renderSameTab = () =>
    this.shouldRenderSameTab()
      ? this.renderLink(this.getSameTabLinkText(), false, event =>
          this.clickHandler(event)
        )
      : null;

  render() {
    return (
      <div className="expanded-title">
        <div className="expanded-filepath">
          <Octicon
            style={{ verticalAlign: "text-bottom", color: "#999" }}
            name="file"
          />
          <span style={{ marginLeft: 3 }}>{this.props.filePath}</span>
        </div>
        {this.renderSameTab()}
        {this.renderNewTab()}
      </div>
    );
  }
}
