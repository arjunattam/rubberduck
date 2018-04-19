import React from "react";
import { bindActionCreators } from "redux";
import SectionHeader from "./Section";
import ExpandedCode from "../common/ExpandedCode";
import * as DataActions from "../../actions/dataActions";

export class BaseSection extends React.Component {
  constructor(props) {
    super(props);
    this.DataActions = bindActionCreators(DataActions, this.props.dispatch);
  }

  componentDidUpdate(prevProps, prevState) {
    const nowVisible = this.props.data.openSection[this.sectionName];

    if (nowVisible) {
      // For usages + definitions
      if (this.updateData) this.updateData(prevProps);
    }
  }

  toggleVisibility = () => {
    let openSection = { ...this.props.data.openSection };
    openSection[this.sectionName] = !openSection[this.sectionName];
    this.DataActions.updateData({ openSection });
  };

  renderSectionHeader = name => (
    <SectionHeader
      onClick={() => this.toggleVisibility()}
      isVisible={this.isVisible()}
      name={name}
    />
  );

  isVisible = () => this.props.data.openSection[this.sectionName];

  isLoading = () => this.props.data.isLoading[this.sectionName];
}

export class BaseReaderSection extends BaseSection {
  updateData(prevProps) {
    const prevHoverResult = prevProps.data.hoverResult;
    const newHoverResult = this.props.data.hoverResult;

    const hasResultChanged =
      prevHoverResult.lineNumber !== newHoverResult.lineNumber ||
      prevHoverResult.charNumber !== newHoverResult.charNumber;

    if (hasResultChanged) {
      this.clearState();
      this.getSelectionData(newHoverResult);
    }
  }

  getFileLink = (fileSha, filePath, lineNumber) => {
    let shaId = "";
    const { base, head } = this.props.data.session;

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

    if (!(y < bottom && y > top && x <= right + PADDING)) {
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
