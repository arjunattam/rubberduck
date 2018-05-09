import React from "react";
import { connect } from "react-redux";
import { BaseReaderSection } from "../section";
import { ReferenceFileSection } from "../section/FileSection";
import InlineButton from "../common/InlineButton";
import { pathNearnessSorter } from "../../utils/data";
import "./References.css";

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
      const { path } = reference.location;
      const { fileSha } = hoverResult;
      const link = this.getFileLink(fileSha, path);
      const obj = { path, fileSha, link };
      accumulator[path] = obj;
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
          () => this.fetchFileContents()
        );
      });
    }
  };

  fetchFileContents = () => {
    const filesToQuery = this.state.references.map(fileObject => ({
      filePath: fileObject.path,
      baseOrHead: fileObject.fileSha === "base" ? fileObject.fileSha : "head"
    }));
    filesToQuery.forEach(fileSignature => {
      this.DataActions.callFileContents(fileSignature);
    });
  };

  renderItems = () => {
    return this.state.references.map(fileObject => (
      <ReferenceFileSection
        key={fileObject.path}
        path={fileObject.path}
        link={fileObject.link}
        {...this.getFileContents(fileObject)}
        items={fileObject.items}
        sidebarWidth={this.props.storage.sidebarWidth}
        isCollapsed={this.state.hasCollapsedFiles}
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
