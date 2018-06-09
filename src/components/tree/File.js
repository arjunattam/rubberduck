import React from "react";
import TreeLabel from "./TreeLabel";
import {
  getGitService,
  getFileboxSelector,
  isSplitDiffGithubView,
  pathAdapter
} from "../../adapters";
import * as AnalyticsUtils from "../../utils/analytics";

const PADDING_CONST = 12; // in pixels -- same as folder

export default class File extends React.Component {
  getPadding = () => (this.props.depth + 1) * PADDING_CONST + 2;

  clickHandler = (href, event) => {
    AnalyticsUtils.logTreeClick(true);
    const { isPRFile } = this.props;
    return isPRFile
      ? this.prClickHandler(href, event)
      : this.pjaxClickHandler(href, event, () => {});
  };

  /**
   * This might seem hacky. Because it is. The intention is that when the files changed view
   * is opened by clicking on a link in the diff tree, the view should take up the whole width.
   * Like it does if you click on the "Files changed" tab on GitHub
   */
  setDiffToFullWidth = () => {
    if (!isSplitDiffGithubView()) return;

    const MAX_OBSERVER_TIMEOUT = 10000;
    const GH_FULL_WIDTH_CLASS = "full-width";

    setTimeout(() => {
      document.body.classList.add(GH_FULL_WIDTH_CLASS);
    }, 100);

    var observer = new MutationObserver(function(mutations) {
      mutations.forEach(function(mutation) {
        if (mutation.type === "attributes") {
          if (!document.body.classList.contains(GH_FULL_WIDTH_CLASS)) {
            document.body.classList.add(GH_FULL_WIDTH_CLASS);
            observer.disconnect();
          }
        }
      });
    });
    observer.observe(document.body, { attributes: true });

    setTimeout(() => {
      observer.disconnect();
    }, MAX_OBSERVER_TIMEOUT);
  };

  pjaxClickHandler = (href, event, callback) => {
    if (!(event.ctrlKey || event.metaKey)) {
      event.preventDefault();
      const { urlLoader } = this.props;
      urlLoader({ urlPath: href }).then(response => {
        callback();
      });
    }
  };

  prClickHandler = (href, event) => {
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
            return this.pjaxClickHandler(href, event, () => {
              this.setDiffToFullWidth();
              return this.scrollTo();
            });
          }
        }
        break;
      case "bitbucket":
        return this.scrollTo();
      default:
        return;
    }
  };

  scrollTo = () => {
    const elementSelector = getFileboxSelector(this.props.path);
    const fileBox = document.querySelector(elementSelector);
    const yOffset = window.scrollY + fileBox.getBoundingClientRect().y - 75;

    setTimeout(function() {
      // Without the timeout, the scrollTo does not work for pjax
      // My guess is this is because the page is incrementally loaded, and not
      // contents are available. TODO(arjun): need to check
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

  isSelected = () => {
    const { path: filePath } = this.props;
    const { repoDetails } = this.props.data;
    const { path: currentPath } = repoDetails;
    return currentPath === filePath;
  };

  renderFileLabel = (href, onClick) => (
    <TreeLabel
      {...this.props}
      icon="file"
      iconColor="#999"
      paddingLeft={this.getPadding()}
      href={href}
      onClick={onClick}
      isSelected={this.isSelected()}
    />
  );

  render() {
    const { isPRFile, path } = this.props;
    const { repoDetails } = this.props.data;
    const { username, reponame, branch } = repoDetails;
    const href = isPRFile
      ? this.getFilesChangedUrl()
      : pathAdapter.constructPath(path, username, reponame, branch);

    return this.renderFileLabel(href, event => this.clickHandler(href, event));
  }
}
