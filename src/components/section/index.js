import React from "react";
import { bindActionCreators } from "redux";
import SectionHeader from "./Section";
import ExpandedCode from "../common/ExpandedCode";
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
      <strong>{"⌘ + click"}</strong>
      {` on symbol to trigger ${this.sectionName}`}
    </div>
  );

  getFileLink = (fileSha, filePath, lineNumber) => {
    let shaId = "";
    const { base, head } = this.props.data.data.session;

    if (fileSha === "base") {
      shaId = base ? base.sha_id : "";
    } else {
      shaId = head ? head.sha_id : "";
    }

    const { username, reponame, branch } = this.props.data.repoDetails;
    const gitId = shaId || branch;
    const offsetLine = lineNumber + 1;
    return `/${username}/${reponame}/blob/${gitId}/${filePath}#L${offsetLine}`;
  };
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

    if (!isOnCodeSnippet) {
      this.setState({
        isHovering: false
      });
    }
  };

  getPositionStyle = () => {
    const { top, bottom } = this.refs.container.getBoundingClientRect();
    const windowHeight = window.innerHeight;
    const isCloseToBottom = windowHeight - bottom < 150;
    return isCloseToBottom ? { bottom: windowHeight - bottom } : { top: top };
  };

  getSnippetStyle = () => ({
    left: this.props.sidebarWidth + 4,
    ...this.getPositionStyle()
  });

  renderExpandedCode = () =>
    this.state.isHovering ? (
      <ExpandedCode {...this.props} style={this.getSnippetStyle()} />
    ) : null;
}
