import React from "react";
import { connect } from "react-redux";
import { BaseReaderSection } from "../section";
import { ReferenceFileSection } from "../section/FileSection";
import InlineButton from "../common/InlineButton";
import "./References.css";

class References extends BaseReaderSection {
  sectionName = "usages";

  state = {
    references: {},
    hasCollapsedFiles: false
  };

  getReferenceObject = (reference, hoverResult) => {
    const parent = reference.parent;
    let parentName = "";

    if (parent !== null) {
      parentName = parent.name;
    } else {
      parentName = reference.location.path.split("/").slice(-1)[0];
    }

    return {
      name: parentName,
      filePath: reference.location.path,
      fileSha: hoverResult.fileSha,
      fileLink: this.getFileLink(
        hoverResult.fileSha,
        reference.location.path,
        reference.location.range.start.line
      ),
      lineNumber: reference.location.range.start.line,
      codeSnippet: reference.contents,
      startLineNumber: reference.contents_start_line
    };
  };

  getReferenceItems = (references, hoverResult) =>
    references.reduce((accumulator, reference) => {
      const filePath = reference.location.path;
      const obj = this.getReferenceObject(reference, hoverResult);

      if (filePath in accumulator) {
        accumulator[filePath].push(obj);
      } else {
        accumulator[filePath] = [obj];
      }
      return accumulator;
    }, []);

  getSelectionData = hoverResult => {
    const isValidResult =
      hoverResult.hasOwnProperty("fileSha") &&
      hoverResult.hasOwnProperty("lineNumber");

    if (isValidResult) {
      this.DataActions.callUsages(hoverResult).then(response => {
        const { result } = response.value;
        const { fileSha } = hoverResult;
        this.setState(
          {
            name: hoverResult.name,
            count: result.count,
            // references is an object {filepath: array of reference items, ...}
            references: this.getReferenceItems(result.references, hoverResult)
          },
          () => this.getFileContents(fileSha)
        );
      });
    }
  };

  getFileContents = fileSha => {
    const filesToQuery = Object.keys(this.state.references).map(key => ({
      filePath: key,
      baseOrHead: fileSha === "base" ? fileSha : "head"
    }));
    filesToQuery.forEach(fileSignature => {
      this.DataActions.callFileContents(fileSignature);
    });
  };

  getCountText = () =>
    this.state.count === 1 ? `1 usage` : `${this.state.count} usages`;

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

  renderContainerTitle = () => (
    <div className="reference-title-container">
      <div className="reference-title">
        <div className="reference-name monospace">{this.state.name}</div>
        <div className="reference-count tree-status">{this.getCountText()}</div>
      </div>
      {this.renderCollapseButton()}
    </div>
  );

  renderFileSections = () =>
    // TODO(arjun): sort by nearness to the current file
    Object.keys(this.state.references).map(key => (
      <ReferenceFileSection
        name={key}
        items={this.state.references[key]}
        key={key}
        sidebarWidth={this.props.storage.sidebarWidth}
        fileContents={this.props.data.fileContents}
        isCollapsed={this.state.hasCollapsedFiles}
      />
    ));

  renderResult = () =>
    this.state.count > 0 ? (
      <div className="reference-container">
        {this.renderContainerTitle()}
        <div className="reference-files">{this.renderFileSections()}</div>
      </div>
    ) : (
      this.renderNoResults()
    );

  renderContents = () =>
    this.state.name ? this.renderResult() : this.renderZeroState();

  render() {
    let referencesClassName = this.isVisible()
      ? "references-section"
      : "references-section collapsed";

    return (
      <div className={referencesClassName}>
        {this.renderSectionHeader()}
        {this.isVisible() ? this.renderContents() : null}
      </div>
    );
  }
}

function mapStateToProps(state) {
  const { storage, data } = state;
  return {
    storage,
    data
  };
}
export default connect(mapStateToProps)(References);
