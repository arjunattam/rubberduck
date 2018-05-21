import React from "react";
import { pathAdapter } from "../../adapters";
import TreeLabel from "./TreeLabel";
import { getGitService } from "../../adapters";

const PADDING_CONST = 12; // in pixels -- same as folder

export default class File extends React.Component {
  getPadding = () => (this.props.depth + 1) * PADDING_CONST + 2;

  clickHandler = event => {
    const service = getGitService();

    switch (service) {
      case "github":
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
        break;
      case "bitbucket":
        return this.scrollTo();
      default:
        return;
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
      // Need a mutation observer?
      window.scrollTo(0, yOffset);
    }, 1.5);
  };

  getFilesChangedUrl = () => {
    const path = window.location.pathname;

    if (path.match(/\/[^/.]+\/[^/.]+\/pull\/\d+\/files.*/) !== null) {
      // The path matches the files changed url
      return null;
    } else if (path.match(/\/[^/.]+\/[^/.]+\/pull\/\d+.*/) !== null) {
      // The path matches other PR urls
      let prBase = path.match(/\/[^/.]+\/[^/.]+\/pull\/\d+/)[0];
      return prBase + "/files";
    }
  };

  renderFileLabel = (href, onClick, isSelected) => (
    <TreeLabel
      {...this.props}
      icon="file"
      iconColor="#999"
      paddingLeft={this.getPadding()}
      href={href}
      onClick={onClick}
      isSelected={isSelected}
    />
  );

  renderBasicFile = isSelected => {
    const { path } = this.props;
    const { username, reponame, branch } = this.props.data.repoDetails;
    const href = pathAdapter.constructPath(path, username, reponame, branch);
    return this.renderFileLabel(href, null, isSelected);
  };

  renderPRFile = isSelected => {
    // This is a PR element, so we will scroll to file changed on the element
    // This might trigger pjax call to open the "files changed" view on Github
    // if that has not been opened already.
    const filesChangedUrl = this.getFilesChangedUrl();
    const onClick = e => this.clickHandler(e);
    return this.renderFileLabel(filesChangedUrl, onClick, isSelected);
  };

  render() {
    const { additions, deletions, status } = this.props;
    const isPR = additions || deletions || status;
    const isSelected = this.props.currentPath === this.props.path;
    return isPR
      ? this.renderPRFile(isSelected)
      : this.renderBasicFile(isSelected);
  }
}
