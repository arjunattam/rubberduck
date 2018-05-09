import React from "react";
import { bindActionCreators } from "redux";
import SectionHeader from "./Section";
import ExpandedCode from "../common/ExpandedCode";
import { getGitService, getMetaKey } from "../../adapters";
import * as DataActions from "../../actions/dataActions";
import SmallCodeSnippet from "../common/SmallCodeSnippet";
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

  getSectionTitle = () =>
    this.sectionName === "tree" ? "files tree" : this.sectionName;

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

  getServiceLink = (username, reponame, gitId, filePath, line) => {
    switch (getGitService()) {
      case "github":
        return `/${username}/${reponame}/blob/${gitId}/${filePath}#L${line}`;
      case "bitbucket":
        return `/${username}/${reponame}/src/${gitId}/${filePath}#lines-${line}`;
      default:
        return "";
    }
  };

  getFileLink = (fileSha, filePath, lineNumber) => {
    let shaId = "";
    const { base, head } = this.props.data.session.payload;

    if (fileSha === "base") {
      shaId = base ? base.sha_id : "";
    } else {
      shaId = head ? head.sha_id : "";
    }

    const { username, reponame, branch } = this.props.data.repoDetails;
    const gitId = shaId || branch;
    const offsetLine = lineNumber + 1;
    return this.getServiceLink(username, reponame, gitId, filePath, offsetLine);
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
    const className = `references-section ${isVisible ? "" : "collapsed"}`;
    return (
      <div className={className}>
        {this.renderSectionHeader()}
        {isVisible ? this.renderContents() : null}
      </div>
    );
  }
}

export class BaseSectionItem extends React.Component {
  state = {
    isHovering: false
  };

  handleMouseEnter = event => {
    this.setState({
      isHovering: true
    });
  };

  handleMouseLeave = event => {
    const rect = this.refs.container.getBoundingClientRect();
    const { clientX: x, clientY: y } = event;
    const { top, bottom, right } = rect;
    const PADDING = 20;
    const isOnCodeSnippet = y < bottom && y > top && x <= right + PADDING;
    const isOutsideWindow = x <= 0;

    if (!isOnCodeSnippet || isOutsideWindow) {
      this.setState({
        isHovering: false
      });
    }
  };

  getSnippetStyle = () => ({
    left: this.props.sidebarWidth + 2,
    top: this.refs.container
      ? this.refs.container.getBoundingClientRect().top
      : 0
  });

  renderExpandedCode = () =>
    this.state.isHovering ? (
      <ExpandedCode {...this.props} style={this.getSnippetStyle()} />
    ) : null;

  render() {
    return (
      <div
        className="reference-item"
        onMouseEnter={this.handleMouseEnter}
        onMouseLeave={this.handleMouseLeave}
        ref={"container"}
      >
        <SmallCodeSnippet
          contents={this.props.codeSnippet}
          contentLine={this.props.lineNumber - this.props.startLineNumber}
          lineNumber={this.props.lineNumber}
        />
        {this.renderExpandedCode()}
      </div>
    );
  }
}
