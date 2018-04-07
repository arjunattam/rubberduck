import React from "react";
import { pathAdapter } from "../../adapters";
import TreeLabel from "./TreeLabel";
import { getGitService } from "../../adapters";

const PADDING_CONST = 12; // in pixels -- same as folder

export default class File extends React.Component {
  getPadding = () => {
    // padding is a function of depth
    return (this.props.depth + 1) * PADDING_CONST + 2;
  };

  clickHandler = event => {
    const service = getGitService();

    if (service === "github") {
      const { pathname } = window.location;

      if (pathname.indexOf("commit") >= 0) {
        // This is a commits page, we can scroll now
        return this.scrollTo();
      } else if (pathname.indexOf("compare") >= 0) {
        // This is a compare page, we can scroll now
        return this.scrollTo();
      } else if (pathname.indexOf("pull") >= 0) {
        // This is a PR page. Can be conversation or files changed
        if (pathname.indexOf("files") >= 0) {
          return this.scrollTo();
        } else {
          // This is the conversation page
          document.addEventListener("pjax:success", this.scrollTo);
        }
      }
    }
  };

  getFileboxSelector = path => {
    const service = getGitService();

    if (service === "github") {
      return `div.file-header[data-path="${path}"]`;
    } else if (service === "bitbucket") {
      return `section.iterable-item[data-path="${path}"]`;
    }
  };

  scrollTo = () => {
    // Can check for event.triggerElement -- in pjax:success call
    // Remove the event listener that we added
    document.removeEventListener("pjax:success", this.scrollTo);
    const elementSelector = this.getFileboxSelector(this.props.path);

    const fileBox = document.querySelector(elementSelector);
    const yOffset = window.scrollY + fileBox.getBoundingClientRect().y - 75;

    setTimeout(function() {
      // Without the timeout, the scrollTo does not work for pjax
      window.scrollTo(0, yOffset);
    }, 1);
  };

  getFilesChangedUrl = () => {
    const path = window.location.pathname;

    if (path.match(/\/[^/.]+\/[^/.]+\/pull\/\d+\/files.*/) !== null) {
      // The path matches the files changed url
      return path;
    } else if (path.match(/\/[^/.]+\/[^/.]+\/pull\/\d+.*/) !== null) {
      // The path matches other PR urls
      let prBase = path.match(/\/[^/.]+\/[^/.]+\/pull\/\d+/)[0];
      return prBase + "/files";
    }
  };

  renderBasicFile = () => {
    const pl = this.getPadding();
    const path = pathAdapter.constructPath(
      this.props.path,
      this.props.data.repoDetails.username,
      this.props.data.repoDetails.reponame,
      this.props.data.repoDetails.branch
    );

    return (
      <a href={path} style={{ paddingLeft: pl }}>
        <TreeLabel {...this.props} icon="file" iconColor="#999" />
      </a>
    );
  };

  renderPRFile = () => {
    // This is a PR element, so we will scroll to file changed on the element
    // This might trigger pjax call to open the "files changed" view on Github
    // if that has not been opened already.
    const pl = this.getPadding();
    const filesChangedUrl = this.getFilesChangedUrl();

    return (
      <a
        href={filesChangedUrl}
        onClick={e => this.clickHandler(e)}
        style={{ paddingLeft: pl }}
      >
        <TreeLabel {...this.props} icon="file" iconColor="#999" />
      </a>
    );
  };

  render() {
    const isPRElement = this.props.additions || this.props.deletions;
    const isSelected = this.props.currentPath === this.props.path;
    let className = "file-container";
    className += isSelected ? " file-selected" : "";

    return (
      <div className={className}>
        {isPRElement ? this.renderPRFile() : this.renderBasicFile()}
      </div>
    );
  }
}
