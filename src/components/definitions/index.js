import React from "react";
import { connect } from "react-redux";
import { BaseReaderSection } from "../section";
import DefinitionItem from "./DefinitionItem";
import "./Definitions.css";

/**
 * This gets the `hoverResult`, makes API call, and then
 * displays the result.
 */
class Definitions extends BaseReaderSection {
  sectionName = "definitions";

  state = {
    definition: {}
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
      this.DataActions.callDefinitions(hoverResult).then(response => {
        const result = response.value.result;
        const definition = {
          // Can use result.signature also for the name key
          // Verify on go: https://github.com/samuel/go-zookeeper/blob/master/zk/server_help.go#L176
          name: result.name || hoverResult.name,
          filePath: this.getFilePath(result),
          fileSha: hoverResult.fileSha,
          startLineNumber: this.getStartLine(result),
          lineNumber: this.getLine(result),
          docstring: result.docstring,
          codeSnippet: result.definition ? result.definition.contents : ""
        };
        this.setState({ definition: definition }, () => this.getFileContents());
      });
    }
  };

  getFileContents = () => {
    const { fileSha, filePath } = this.state.definition;
    const baseOrHead = fileSha === "base" ? fileSha : "head";
    this.DataActions.callFileContents({ baseOrHead, filePath });
  };

  buildFileLink = () => {
    const { fileSha, filePath, lineNumber } = this.state.definition;
    if (fileSha && filePath && lineNumber) {
      return this.getFileLink(fileSha, filePath, lineNumber);
    }
  };

  fileContentProps = () => {
    const { fileContents } = this.props.data;
    const { fileSha, filePath } = this.state.definition;
    const baseOrHead = fileSha === "base" ? fileSha : "head";
    const contentsInStore = fileContents[baseOrHead][filePath];
    return contentsInStore
      ? { codeSnippet: contentsInStore, startLineNumber: 0 }
      : {};
  };

  renderContents = () =>
    this.state.definition.name ? (
      <DefinitionItem
        {...this.state.definition}
        {...this.fileContentProps()}
        fileLink={this.buildFileLink()}
        visible={this.isVisible()}
        sidebarWidth={this.props.storage.sidebarWidth}
      />
    ) : (
      this.renderZeroState()
    );

  render() {
    let definitonClassName = this.isVisible()
      ? "definitions-section"
      : "definitions-section collapsed";
    return (
      <div className={definitonClassName}>
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
export default connect(mapStateToProps)(Definitions);
