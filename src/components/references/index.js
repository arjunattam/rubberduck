import React from "react";
import { connect } from "react-redux";
import { BaseReaderSection } from "../section";
import ReferenceItem from "./ReferenceItem";
import "./References.css";

class References extends BaseReaderSection {
  sectionName = "usages";

  state = {
    references: []
  };

  getReferenceItems = (apiResponse, hoverResult) => {
    return apiResponse.references.map(reference => {
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
    });
  };

  getSelectionData = hoverResult => {
    const isValidResult =
      hoverResult.hasOwnProperty("fileSha") &&
      hoverResult.hasOwnProperty("lineNumber");

    if (isValidResult) {
      this.DataActions.callUsages(hoverResult).then(response => {
        const { result } = response.value;
        this.setState(
          {
            name: hoverResult.name,
            count: result.count,
            references: this.getReferenceItems(result, hoverResult)
          },
          () => this.getFileContents()
        );
      });
    }
  };

  getFileContents = () => {
    const filesToQuery = this.state.references.map(reference => {
      return {
        filePath: reference.filePath,
        baseOrHead: reference.fileSha === "base" ? reference.fileSha : "head"
      };
    });
    // Remove duplicates
    let filtered = filesToQuery.reduce((accumulator, current) => {
      if (!accumulator.find(({ filePath }) => filePath === current.filePath)) {
        accumulator.push(current);
      }
      return accumulator;
    }, []);
    filtered.forEach(fileSignature => {
      this.DataActions.callFileContents(fileSignature);
    });
  };

  getCountText = () =>
    this.state.count === 1 ? `1 usage` : `${this.state.count} usages`;

  renderContainerTitle = () => (
    <div className="reference-title">
      <div className="reference-name monospace">{this.state.name}</div>
      <div className="reference-count">{this.getCountText()}</div>
    </div>
  );

  renderItems = () => {
    const { sidebarWidth } = this.props.storage;
    const { fileContents } = this.props.data;
    const referenceItems = this.state.references.map((reference, index) => {
      const { fileSha, filePath } = reference;
      const baseOrHead = fileSha === "base" ? fileSha : "head";
      const contentsInStore = fileContents[baseOrHead][filePath];
      // Get contents from store if available, else use what we have
      const fileProps = contentsInStore
        ? { codeSnippet: contentsInStore, startLineNumber: 0 }
        : {};

      return (
        <ReferenceItem
          {...reference}
          key={index}
          sidebarWidth={sidebarWidth}
          {...fileProps}
        />
      );
    });
    return <div className="reference-items">{referenceItems}</div>;
  };

  renderReferences = () =>
    this.state.count > 0 ? (
      <div className="reference-container">
        {this.renderContainerTitle()}
        {this.renderItems()}
      </div>
    ) : (
      this.renderNoResults()
    );

  renderContents = () =>
    this.state.name ? this.renderReferences() : this.renderZeroState();

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
