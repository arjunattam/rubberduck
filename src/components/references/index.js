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
  state = {
    isVisible: false,
    isLoading: false,
    references: []
  };

  clearState = () => {
    this.setState({
      references: []
    });
  };

  getFileLink = (filePath, lineNumber) => {
    const { username, reponame, branch } = this.props.data.repoDetails;
    const offsetLine = lineNumber + 1;
    return `/${username}/${reponame}/blob/${branch}/${filePath}#L${offsetLine}`;
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
        filePath: reference.location.path,
        fileLink: this.getFileLink(
          reference.location.path,
          reference.location.range.start.line
        ),
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
      this.startLoading();
      WS.getReferences(
        hoverResult.fileSha,
        hoverResult.filePath,
        hoverResult.lineNumber,
        hoverResult.charNumber
      )
        .then(response => {
          this.stopLoading();
          this.setState({
            name: hoverResult.name,
            count: response.result.count,
            references: this.getReferenceItems(response.result)
          });
        })
        .catch(error => {
          this.stopLoading();
          console.log("Error in API call", error);
        });
    }
  };

  renderTitle = () =>
    this.state.isLoading ? (
      <div className="loader-container" style={{ marginTop: 20 }}>
        <div className="status-loader" />
      </div>
    ) : this.props.selectionX ? (
      <div className="reference-title">
        <div className="reference-name monospace">{this.state.name}</div>
        <div className="reference-count">{this.state.count} references</div>
      </div>
    ) : (
      this.renderZeroState()
    );

  render() {
    const referenceItems = this.state.references.map((reference, index) => {
      return <ReferenceItem {...reference} key={index} />;
    });

    let referencesClassName = this.state.isVisible
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
