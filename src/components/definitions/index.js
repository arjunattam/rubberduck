import React from "react";
import { connect } from "react-redux";
import { BaseReaderSection } from "../section";
import { WS } from "./../../utils/websocket";
import DefinitionItem from "./DefinitionItem";
import "./Definitions.css";

class Definitions extends BaseReaderSection {
  // This gets x and y of the selected text, constructs the
  // API call payload by reading DOM, and then display the
  // result of the API call.
  sectionName = "definitions";

  state = {
    isVisible: false,
    isLoading: false,
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

  getSelectionData = () => {
    const hoverResult = this.readPage();
    const isValidResult =
      hoverResult.hasOwnProperty("fileSha") &&
      hoverResult.hasOwnProperty("lineNumber");

    if (isValidResult && this.state.isVisible) {
      this.startLoading();
      const { fileSha, filePath, lineNumber, charNumber } = hoverResult;
      WS.getDefinition(fileSha, filePath, lineNumber, charNumber)
        .then(response => {
          this.stopLoading();
          const result = response.result;
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
          this.stopLoading();
          console.log("Error in API call", error);
        });
    }
  };

  buildFileLink = () => {
    const { fileSha, filePath, lineNumber } = this.state.definition;
    return this.getFileLink(fileSha, filePath, lineNumber);
  };

  renderItems = () =>
    this.state.isLoading ? (
      <div className="loader-container" style={{ marginTop: 20 }}>
        <div className="status-loader" />
      </div>
    ) : this.props.selectionX ? (
      <DefinitionItem
        {...this.state.definition}
        fileLink={this.buildFileLink()}
        visible={this.state.isVisible}
        sidebarWidth={this.props.storage.sidebarWidth}
      />
    ) : (
      this.renderZeroState()
    );

  render() {
    let definitonClassName = this.state.isVisible
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
