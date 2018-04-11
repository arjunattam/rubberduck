import React from "react";
import { connect } from "react-redux";
import { BaseReaderSection } from "../section";
import { WS } from "../../utils/websocket";
import ReferenceItem from "./ReferenceItem";
import "./References.css";

class References extends BaseReaderSection {
  // This gets x and y of the selected text, constructs the
  // API call payload by reading DOM, and then display the
  // result of the API call.
  sectionName = "references";

  state = {
    isLoading: false,
    references: []
  };

  clearState = () => {
    this.setState({
      references: []
    });
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
      this.startLoading();
      const { fileSha, filePath, lineNumber, charNumber } = hoverResult;
      WS.getReferences(fileSha, filePath, lineNumber, charNumber)
        .then(response => {
          this.stopLoading();
          this.setState({
            name: hoverResult.name,
            count: response.result.count,
            references: this.getReferenceItems(response.result, hoverResult)
          });
        })
        .catch(error => {
          this.stopLoading();
          console.log("Error in API call", error);
        });
    }
  };

  getCountText = () =>
    this.state.count === 1 ? `1 usage` : `${this.state.count} usages`;

  renderTitle = () =>
    this.state.isLoading ? (
      <div className="loader-container" style={{ marginTop: 20 }}>
        <div className="status-loader" />
      </div>
    ) : (
      <div className="reference-title">
        <div className="reference-name monospace">{this.state.name}</div>
        <div className="reference-count">{this.getCountText()}</div>
      </div>
    );

  render() {
    const { sidebarWidth } = this.props.storage;
    const referenceItems = this.state.references.map((reference, index) => {
      return (
        <ReferenceItem {...reference} key={index} sidebarWidth={sidebarWidth} />
      );
    });

    let referencesClassName = this.isVisible()
      ? "references-section"
      : "references-section collapsed";

    return (
      <div className={referencesClassName}>
        {this.renderSectionHeader("Usages")}
        <div className="reference-container">
          {this.renderTitle()}
          <div className="reference-items">{referenceItems}</div>
        </div>
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
