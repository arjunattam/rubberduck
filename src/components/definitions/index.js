import React from "react";
import { connect } from "react-redux";
import { BaseReaderSection } from "../section";
import DefinitionItem from "./DefinitionItem";
import "./Definitions.css";

class Definitions extends BaseReaderSection {
  // This gets x and y of the selected text, constructs the
  // API call payload by reading DOM, and then display the
  // result of the API call.
  sectionName = "definitions";

  state = {
    definition: {}
  };

  clearState = () => {
    this.setState({
      definition: {}
    });
  };

  getFilePath = result =>
    result.definition && result.definition.location
      ? result.definition.location.path
      : "";

  getStartLine = result =>
    result.definition ? result.definition.contents_start_line : null;

  getLine = result =>
    result.definition && result.definition.location
      ? result.definition.location.range.start.line
      : null;

  getSelectionData = hoverResult => {
    // const hoverResult = this.readPage();
    const isValidResult =
      hoverResult.hasOwnProperty("fileSha") &&
      hoverResult.hasOwnProperty("lineNumber");

    if (isValidResult) {
      this.DataActions.callDefinitions(hoverResult)
        .then(response => {
          const result = response.value.result;
          const definition = {
            name: result.name,
            filePath: this.getFilePath(result),
            fileSha: hoverResult.fileSha,
            startLineNumber: this.getStartLine(result),
            lineNumber: this.getLine(result),
            docstring: result.docstring,
            codeSnippet: result.definition ? result.definition.contents : ""
          };
          this.setState({ definition: definition });
        })
        .catch(error => {
          console.log("Error in API call", error);
        });
    }
  };

  buildFileLink = () => {
    const { fileSha, filePath, lineNumber } = this.state.definition;

    if (fileSha && filePath && lineNumber) {
      return this.getFileLink(fileSha, filePath, lineNumber);
    }
  };

  renderItems = () =>
    this.isLoading() ? (
      <div className="loader-container" style={{ marginTop: 20 }}>
        <div className="status-loader" />
      </div>
    ) : (
      <DefinitionItem
        {...this.state.definition}
        fileLink={this.buildFileLink()}
        visible={this.isVisible()}
        sidebarWidth={this.props.storage.sidebarWidth}
      />
    );

  render() {
    let definitonClassName = this.isVisible()
      ? "definitions-section"
      : "definitions-section collapsed";
    return (
      <div className={definitonClassName}>
        {this.renderSectionHeader("Definitions")}
        {this.renderItems()}
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
export default connect(mapStateToProps)(Definitions);
