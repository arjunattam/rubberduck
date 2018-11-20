import React from "react";
import { connect } from "react-redux";
import { BaseReaderSection } from "../section";
import { UsageFileSection } from "../section/FileSection";
import InlineButton from "../common/InlineButton";
import "./index.css";

const MAX_FILES_TO_PREFETCH = 3;

class Usages extends BaseReaderSection {
  sectionName = "usages";

  state = {
    hasCollapsedFiles: false
  };

  getSelectionData = async hoverResult => {
    const isValidResult =
      hoverResult.hasOwnProperty("fileSha") &&
      hoverResult.hasOwnProperty("lineNumber");

    if (isValidResult) {
      const params = {
        // TODO: also setup for base --> check via hoverResult
        repo: this.props.data.view.head,
        query: {
          path: hoverResult.filePath,
          line: hoverResult.lineNumber,
          character: hoverResult.charNumber
        }
      };
      await this.DataActions.callUsages(params, hoverResult);
      // TODO: decide when to pull for contents
      // this.fetchUsagesContents();
    }
  };

  fetchUsagesContents = () => {
    const usagesCopy = [].concat(this.props.data.usages.items);
    const fetchable = usagesCopy.splice(0, MAX_FILES_TO_PREFETCH);
    fetchable.forEach(fileObject => this.fetchContents(fileObject));
  };

  renderItems = () => {
    const { data, storage } = this.props;
    return data.usages.items.map(fileObject => (
      <UsageFileSection
        key={fileObject.filePath}
        path={fileObject.filePath}
        link={this.getFileLink(fileObject.fileSha, fileObject.filePath)}
        {...this.getFileContents(fileObject)}
        items={fileObject.items}
        sidebarWidth={storage.sidebarWidth}
        isParentCollapsed={this.state.hasCollapsedFiles}
        onHover={() => this.fetchContents(fileObject)}
      />
    ));
  };

  collapseFileSections = () =>
    this.setState({ hasCollapsedFiles: !this.state.hasCollapsedFiles });

  renderCollapseButton = () => {
    const numFiles = Object.keys(this.props.data.usages.items).length;

    if (numFiles <= 1) {
      // Don't show collapse button if there's just one file
      return null;
    }

    const filesText = numFiles === 1 ? `1 file` : `${numFiles} files`;
    const canCollapse = !this.state.hasCollapsedFiles;
    const collapseText = canCollapse ? `Collapse` : `Expand`;

    return (
      <div style={{ textAlign: "center" }}>
        <InlineButton
          onClick={this.collapseFileSections}
          text={`${collapseText} ${filesText}`}
        />
      </div>
    );
  };

  getCountText = () =>
    this.props.data.usages.count === 1
      ? `1 usage`
      : `${this.props.data.usages.count} usages`;

  renderDocstring = () => null;

  hasResults = () => this.props.data.usages.count > 0;

  getName = () => this.props.data.usages.name;

  isTriggered = () => (this.props.data.usages.name ? true : false);
}

function mapStateToProps(state) {
  const { storage, data } = state;
  return {
    storage,
    data
  };
}
export default connect(mapStateToProps)(Usages);
