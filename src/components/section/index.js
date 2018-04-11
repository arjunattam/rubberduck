import React from "react";
import { bindActionCreators } from "redux";
import PropTypes from "prop-types";
import SectionHeader from "./Section";
import { getPageReader } from "../../adapters";
import * as DataActions from "../../actions/dataActions";

export class BaseSection extends React.Component {
  constructor(props) {
    super(props);
    this.DataActions = bindActionCreators(DataActions, this.props.dispatch);
  }

  componentWillReceiveProps(newProps) {
    const nowVisible = newProps.data.openSection[this.sectionName];
    if (nowVisible !== this.state.isVisible) {
      this.setState({ isVisible: nowVisible });
    }
    if (this.postCWRPHook) this.postCWRPHook(newProps);
  }

  toggleVisibility = () => {
    let openSection = { ...this.props.data.openSection };
    openSection[this.sectionName] = !this.state.isVisible;
    this.DataActions.updateData({ openSection });
  };

  renderSectionHeader = name => (
    <SectionHeader
      onClick={() => this.toggleVisibility()}
      isVisible={this.state.isVisible}
      name={name}
    />
  );
}

export class BaseReaderSection extends BaseSection {
  static propTypes = {
    selectionX: PropTypes.number,
    selectionY: PropTypes.number
  };

  componentDidUpdate(prevProps, prevState) {
    const hasSelectionChanged =
      prevProps.selectionX !== this.props.selectionX ||
      prevProps.selectionY !== this.props.selectionY;
    const hasVisibilityChanged = prevProps.isVisible !== this.props.isVisible;
    if (hasSelectionChanged || hasVisibilityChanged) {
      this.clearState();
      this.getSelectionData();
    }
  }

  readPage = () => {
    const reader = getPageReader();

    if (reader !== null) {
      return reader(
        this.props.selectionX,
        this.props.selectionY,
        this.props.data.repoDetails.branch
      );
    }

    return {};
  };

  renderZeroState = () => (
    <div className="zero-state">Hover over symbols to trigger</div>
  );

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
