import React from "react";
import { connect } from "react-redux";
import SectionHeader from "../common/Section";
import BaseSection from "../section";
import { WS } from "../../utils/websocket";
import ReferenceItem from "./ReferenceItem";
import "./References.css";

class References extends BaseSection {
  // This gets x and y of the selected text, constructs the
  // API call payload by reading DOM, and then display the
  // result of the API call.
  state = {
    isVisible: false,
    references: []
  };

  getReferenceItems = apiResponse => {
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
        file: reference.location.path,
        lineNumber: reference.location.range.start.line,
        codeSnippet: reference.contents,
        startLineNumber: reference.contents_start_line
      };
    });
  };

  getSelectionData = () => {
    const hoverResult = this.readPage();

    const isValidResult =
      hoverResult.hasOwnProperty("fileSha") &&
      hoverResult.hasOwnProperty("lineNumber");

    if (isValidResult && this.state.isVisible) {
      WS.getReferences(
        hoverResult.fileSha,
        hoverResult.filePath,
        hoverResult.lineNumber,
        hoverResult.charNumber
      )
        .then(response => {
          this.setState({
            name: hoverResult.name,
            count: response.result.count,
            references: this.getReferenceItems(response.result)
          });
        })
        .catch(error => {
          console.log("Error in API call", error);
        });
    }
  };

  render() {
    const referenceItems = this.state.references.map((reference, index) => {
      return <ReferenceItem {...reference} key={index} />;
    });

    let referencesClassName = this.state.isVisible
      ? "references-section"
      : "references-section collapsed";

    return (
      <div className={referencesClassName}>
        <SectionHeader
          onClick={this.toggleVisibility}
          isVisible={this.state.isVisible}
          name={"Usages"}
        />
        <div className="reference-container">
          <div className="reference-title">
            <div className="reference-name monospace">{this.state.name}</div>
            <div className="reference-count">{this.state.count} references</div>
          </div>
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
