import React from "react";
import { connect } from "react-redux";
import { BaseReaderSection } from "../section";
import { DefinitionFileSection } from "../section/FileSection";
import Docstring from "../common/Docstring";
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
    const isValidResult =
      hoverResult.hasOwnProperty("fileSha") &&
      hoverResult.hasOwnProperty("lineNumber");

    if (isValidResult) {
      this.DataActions.callDefinitions(hoverResult).then(response => {
        const result = response.value.result;
        const filePath = this.getFilePath(result);
        const { fileSha } = hoverResult;
        const lineNumber = this.getLine(result);
        const fileLink = this.getFileLink(fileSha, filePath, lineNumber);
        const definition = {
          // Can use result.signature also for the name key
          // Verify on go: https://github.com/samuel/go-zookeeper/blob/master/zk/server_help.go#L176
          name: result.name || hoverResult.name,
          filePath,
          fileSha: hoverResult.fileSha,
          fileLink,
          startLineNumber: this.getStartLine(result),
          lineNumber,
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
    return filePath
      ? this.DataActions.callFileContents({ baseOrHead, filePath })
      : null;
  };

  buildFileLink = () => {
    const { fileSha, filePath, lineNumber } = this.state.definition;
    if (fileSha && filePath && lineNumber) {
      return this.getFileLink(fileSha, filePath, lineNumber);
    }
  };

  renderContainerTitle = () => (
    <div className="reference-title-container">
      <div className="reference-title">
        <div className="reference-name monospace">
          {this.state.definition.name}
        </div>
      </div>
    </div>
  );

  renderItem = () => {
    const items = [this.state.definition];
    const { filePath: name } = this.state.definition;
    const { fileContents } = this.props.data;
    const { sidebarWidth } = this.props.storage;
    return (
      <DefinitionFileSection {...{ name, items, fileContents, sidebarWidth }} />
    );
  };

  renderDocstring = () =>
    this.state.definition.docstring ? (
      <div className="definition-docstring">
        <Docstring docstring={this.state.definition.docstring} />
      </div>
    ) : null;

  renderResult = () =>
    this.state.definition.filePath ? (
      <div className="reference-container">
        {this.renderContainerTitle()}
        {this.renderDocstring()}
        <div className="reference-files">{this.renderItem()}</div>
      </div>
    ) : (
      this.renderNoResults()
    );

  renderContents = () =>
    this.state.definition.name ? this.renderResult() : this.renderZeroState();

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
