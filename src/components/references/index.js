import React from "react";
import { connect } from "react-redux";
import { BaseReaderSection } from "../section";
import { ReferenceFileSection } from "../section/FileSection";
import InlineButton from "../common/InlineButton";
import { pathNearnessSorter } from "../../utils/data";
import "./References.css";

const MAX_FILES_TO_PREFETCH = 3;

class References extends BaseReaderSection {
  sectionName = "usages";

  state = {
    references: [],
    hasCollapsedFiles: false
  };

  clearState = name =>
    this.setState({ references: [], name, count: undefined });

  getReferenceObject = reference => {
    return {
      lineNumber: reference.location.range.start.line,
      codeSnippet: reference.contents,
      startLineNumber: reference.contents_start_line
    };
  };

  getReferenceItems = (apiResult, hoverResult) => {
    // Sort references by line number
    let itemsObjects = apiResult.reduce((accumulator, reference) => {
      const { path } = reference.location;
      const obj = this.getReferenceObject(reference);
      accumulator[path] =
        path in accumulator ? [obj, ...accumulator[path]] : [obj];
      return accumulator;
    }, {});

    Object.keys(itemsObjects).forEach(key => {
      itemsObjects[key].sort((x, y) => x.lineNumber - y.lineNumber);
    });

    const metadataObjects = apiResult.reduce((accumulator, reference) => {
      const { path: filePath } = reference.location;
      const { fileSha } = hoverResult;
      const link = this.getFileLink(fileSha, filePath);
      const obj = { filePath, fileSha, link };
      accumulator[filePath] = obj;
      return accumulator;
    }, {});

    const files = Object.keys(itemsObjects);
    const currentFilePath = hoverResult.filePath || "";
    files.sort((x, y) => pathNearnessSorter(x, y, currentFilePath));
    const items = files.map(file => {
      return {
        items: itemsObjects[file],
        ...metadataObjects[file]
      };
    });
    return items;
  };

  getSelectionData = hoverResult => {
    const isValidResult =
      hoverResult.hasOwnProperty("fileSha") &&
      hoverResult.hasOwnProperty("lineNumber");

    if (isValidResult) {
      this.clearState(hoverResult.name);
      this.DataActions.callUsages(hoverResult).then(response => {
        const { result } = response.value;
        this.setState(
          {
            name: hoverResult.name,
            count: result.count,
            references: this.getReferenceItems(result.references, hoverResult)
          },
          () => this.fetchReferencesContents()
        );
      });
    }
  };

  fetchReferencesContents = () => {
    const referencesCopy = [].concat(this.state.references);
    const fetchable = referencesCopy.splice(0, MAX_FILES_TO_PREFETCH);
    fetchable.forEach(fileObject => this.fetchContents(fileObject));
  };

  renderItems = () => {
    return this.state.references.map(fileObject => (
      <ReferenceFileSection
        key={fileObject.filePath}
        path={fileObject.filePath}
        link={fileObject.link}
        {...this.getFileContents(fileObject)}
        items={fileObject.items}
        sidebarWidth={this.props.storage.sidebarWidth}
        isParentCollapsed={this.state.hasCollapsedFiles}
        onHover={() => this.fetchContents(fileObject)}
      />
    ));
  };

  collapseFileSections = () =>
    this.setState({ hasCollapsedFiles: !this.state.hasCollapsedFiles });

  renderCollapseButton = () => {
    const numFiles = Object.keys(this.state.references).length;

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
    this.state.count === 1 ? `1 usage` : `${this.state.count} usages`;

  renderDocstring = () => null;

  hasResults = () => this.state.count > 0;

  getName = () => this.state.name;

  isTriggered = () => (this.state.name ? true : false);
}

function mapStateToProps(state) {
  const { storage, data } = state;
  return {
    storage,
    data
  };
}
export default connect(mapStateToProps)(References);
