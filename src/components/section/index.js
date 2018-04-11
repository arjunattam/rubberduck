import React from "react";
import { bindActionCreators } from "redux";
import SectionHeader from "./Section";
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

    // For tree loader
    if (this.postLifecycleHook) this.postLifecycleHook();
  }

  toggleVisibility = () => {
    let openSection = { ...this.props.data.openSection };
    openSection[this.sectionName] = !openSection[this.sectionName];
    this.DataActions.updateData({ openSection });
  };

  renderSectionHeader = name => (
    <SectionHeader
      onClick={() => this.toggleVisibility()}
      isVisible={this.state.isVisible}
      name={name}
    />
  );

  isVisible = () => this.props.data.openSection[this.sectionName];
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

  startLoading = () => {
    this.setState({
      isLoading: true
    });
  };

  stopLoading = () => {
    this.setState({
      isLoading: false
    });
  };

  getFileLink = (fileSha, filePath, lineNumber) => {
    let shaId = "";
    const currentSection = this.props.data.session;

    if (fileSha === "base") {
      shaId = currentSection.base.sha_id;
    } else {
      shaId = currentSection.head.sha_id;
    }

    const { username, reponame, branch } = this.props.data.repoDetails;
    const gitId = shaId || branch;
    const offsetLine = lineNumber + 1;
    return `/${username}/${reponame}/blob/${gitId}/${filePath}#L${offsetLine}`;
  };
}
