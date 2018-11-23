import React from "react";
import PropTypes from "prop-types";
import Octicon from "react-component-octicons";
import InlineButton from "../common/InlineButton";
import {
  getGitService,
  isGithubCompareView,
  getFileboxSelector,
  appendLineNumber
} from "../../adapters";

export default class Title extends React.Component {
  static propTypes = {
    filePath: PropTypes.string.isRequired,
    baseLink: PropTypes.string.isRequired,
    currentLineNumber: PropTypes.number.isRequired,
    urlLoader: PropTypes.func.isRequired
  };

  getFileLink = () => {
    return appendLineNumber(this.props.baseLink, this.props.currentLineNumber);
  };

  hasFileinCompareView = () => {
    return document.querySelector(getFileboxSelector(this.props.filePath))
      ? true
      : false;
  };

  scrollToDOMSelector = elementSelector => {
    const element = document.querySelector(elementSelector);
    const yOffset = window.scrollY + element.getBoundingClientRect().y - 75;
    window.scrollTo(0, yOffset);
  };

  scrollTo = () => {
    const elementSelector = getFileboxSelector(this.props.filePath);
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
          const { urlLoader } = this.props;
          return urlLoader({ urlPath: this.getFileLink() }).then(response => {
            this.highlightLine(this.getLineId());
          });
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
