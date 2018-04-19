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
        this.setState({
          name: hoverResult.name,
          count: result.count,
          references: this.getReferenceItems(result, hoverResult)
        });
      });
    }
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
    const referenceItems = this.state.references.map((reference, index) => (
      <ReferenceItem {...reference} key={index} sidebarWidth={sidebarWidth} />
    ));
    return <div className="reference-items">{referenceItems}</div>;
  };

  renderContents = () =>
    this.state.name ? (
      <div className="reference-container">
        {this.renderContainerTitle()}
        {this.renderItems()}
      </div>
    ) : (
      this.renderZeroState()
    );

  render() {
    let referencesClassName = this.isVisible()
      ? "references-section"
      : "references-section collapsed";

    return (
      <div className={referencesClassName}>
        {this.renderSectionHeader()}
        {this.renderContents()}
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
