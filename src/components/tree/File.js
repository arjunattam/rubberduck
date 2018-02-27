import React from "react";
import Octicon from "react-component-octicons";
import { constructPath } from "../../adapters/github/path";
import "./Tree.css";

export const TreeLabel = props => {
  const additions = props.additions ? (
    <span className="tree-additions">{props.additions}</span>
  ) : null;
  const deletions = props.deletions ? (
    <span className="tree-deletions">{props.deletions}</span>
  ) : null;

  return (
    <span>
      <Octicon
        name={props.icon}
        style={{ height: 15, color: props.iconColor }}
      />{" "}
      {props.name} {additions} {deletions}
    </span>
  );
};

export class File extends React.Component {
  getPadding = () => {
    // padding is a function of depth
    return (this.props.depth + 1) * 12 + 2;
  };

  clickHandler = event => {
    if (window.location.pathname.indexOf("files") < 0) {
      // This is not the files changed view, so the scroll to will break
      // This check will break if the org/repo name has the word "files" in it
      // TODO(arjun): We might also want to abstract this out for bitbucket

      // Wait for pjax to trigger, and then call this method again, when we will
      // be on the files changed view.
      document.addEventListener("pjax:success", this.scrollTo);
    } else {
      // We are on the files changed page
      return this.scrollTo();
    }
  };

  scrollTo = () => {
    // Can check for event.triggerElement -- in pjax:success call
    // Remove the event listener that we added
    document.removeEventListener("pjax:success", this.scrollTo);

    const fileBox = document.querySelectorAll(
      `div.file-header[data-path="${this.props.path}"]`
    )[0];
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

  render() {
    const pl = this.getPadding();
    const path = constructPath(
      this.props.path,
      this.props.data.repoDetails.username,
      this.props.data.repoDetails.reponame,
      this.props.data.repoDetails.branch
    );
    const isPRElement = this.props.additions || this.props.deletions;

    if (isPRElement) {
      // This is a PR element, so we will scroll to file changed on the element
      // This might trigger pjax call to open the "files changed" view on Github
      // if that has not been opened already.
      const filesChangedUrl = this.getFilesChangedUrl();

      return (
        <div className="file-container">
          <a
            href={filesChangedUrl}
            onClick={e => this.clickHandler(e)}
            style={{ paddingLeft: pl }}
          >
            <TreeLabel {...this.props} icon="file" iconColor="#999" />
          </a>
        </div>
      );
    } else {
      return (
        <div className="file-container">
          <a href={path} style={{ paddingLeft: pl }}>
            <TreeLabel {...this.props} icon="file" iconColor="#999" />
          </a>
        </div>
      );
    }
  }
}
