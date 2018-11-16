import React from "react";
import { bindActionCreators } from "redux";
import SectionHeader from "./SectionHeader";
import { getGitService, getMetaKey } from "../../adapters";
import * as DataActions from "../../actions/dataActions";
import "./Section.css";

export class BaseSection extends React.Component {
  constructor(props) {
    super(props);
    this.DataActions = bindActionCreators(DataActions, this.props.dispatch);
  }

  toggleVisibility = () => {
    let openSection = { ...this.props.data.section.openSection };
    openSection[this.sectionName] = !openSection[this.sectionName];
    this.DataActions.setOpenSection(openSection);
  };

  getSectionTitle = () => this.sectionName;

  renderSectionHeader = () => (
    <SectionHeader
      onClick={() => this.toggleVisibility()}
      isVisible={this.isVisible()}
      name={this.getSectionTitle()}
      isLoading={this.isLoading()}
    />
  );

  isVisible = () => this.props.data.section.openSection[this.sectionName];

  isLoading = () => this.props.data.section.isLoading[this.sectionName];
}

export class BaseReaderSection extends BaseSection {
  componentDidUpdate(prevProps, prevState) {
    const prevHoverResult = prevProps.data.hoverResult;
    const newHoverResult = this.props.data.hoverResult;

    const hasResultChanged =
      prevHoverResult.lineNumber !== newHoverResult.lineNumber ||
      prevHoverResult.charNumber !== newHoverResult.charNumber;

    if (hasResultChanged) {
      this.getSelectionData(newHoverResult);
    }
  }

  renderZeroState = () => (
    <div className="section-zero-state">
      <strong>{`${getMetaKey()} + click`}</strong>
      {` on symbol to trigger ${this.sectionName}`}
    </div>
  );

  getServiceLink = (username, reponame, gitId, filePath) => {
    switch (getGitService()) {
      case "github":
        return `/${username}/${reponame}/blob/${gitId}/${filePath}`;
      case "bitbucket":
        return `/${username}/${reponame}/src/${gitId}/${filePath}`;
      default:
        return "";
    }
  };

  getFileLink = (fileSha, filePath) => {
    const { session, repoDetails } = this.props.data;
    const { base, head } = session.payload;
    const { headSha, baseSha, prId, branch } = repoDetails;
    let shaId = "";

    if (fileSha === "base") {
      shaId = base ? base.sha_id : "";
    } else {
      shaId = head ? head.sha_id : "";
    }

    // Special handling for a common case
    // Suppose you are browsing the repo on the master branch and want the
    // link. In this case, we don't want the head sha value. Instead we will
    // use the branch name only
    const isBasicCase = !headSha && !baseSha && !prId && branch;
    if (fileSha !== "base" && isBasicCase) {
      shaId = branch;
    }

    const gitId = shaId || branch;
    const { username, reponame } = repoDetails;
    return this.getServiceLink(username, reponame, gitId, filePath);
  };

  getStatusText = () => {
    if (this.isLoading()) {
      return "Loading";
    } else if (!this.hasResults()) {
      return "No result";
    } else {
      return this.getCountText();
    }
  };

  getDefaultContents = fileObject => {
    const referenceItem = fileObject.items ? fileObject.items[0] : {};
    const { codeSnippet: contents, startLineNumber } = referenceItem;
    return { contents, startLineNumber };
  };

  fetchContents = fileObject => {
    const { filePath, fileSha } = fileObject;
    const baseOrHead = fileSha === "base" ? fileSha : "head";
    return filePath
      ? this.DataActions.callFileContents({ baseOrHead, filePath })
      : null;
  };

  getFileContents = fileObject => {
    const { fileSha, filePath } = fileObject;
    const baseOrHead = fileSha === "base" ? fileSha : "head";
    const { fileContents: contentStore } = this.props.data;
    const contentsInStore = contentStore[baseOrHead][filePath];
    return contentsInStore
      ? { contents: contentsInStore, startLineNumber: 0 }
      : this.getDefaultContents(fileObject);
  };

  renderContainerTitle = () => (
    <div className="reference-title-container">
      <div className="reference-title">
        <div className="reference-name monospace">{this.getName()}</div>
        {this.getStatusText() ? (
          <div className="reference-count tree-status">
            {this.getStatusText()}
          </div>
        ) : null}
      </div>
      {this.renderCollapseButton()}
    </div>
  );

  renderResult = () => (
    <div className="reference-container">
      {this.renderContainerTitle()}
      {this.renderDocstring()}
      <div className="reference-files">{this.renderItems()}</div>
    </div>
  );

  renderContents = () =>
    this.isTriggered() ? this.renderResult() : this.renderZeroState();

  render() {
    const isVisible = this.isVisible();
    const className = `usages-section ${isVisible ? "" : "collapsed"}`;
    return (
      <div className={className}>
        {this.renderSectionHeader()}
        {isVisible ? this.renderContents() : null}
      </div>
    );
  }
}
