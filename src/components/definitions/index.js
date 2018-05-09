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

  clearState = name => this.setState({ definition: { name } });

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
      this.clearState(hoverResult.name);
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

  renderItems = () => {
    const items = [this.state.definition];
    const { filePath: name } = this.state.definition;
    const { fileContents } = this.props.data;
    const { sidebarWidth } = this.props.storage;
    return this.hasResults() ? (
      <DefinitionFileSection {...{ name, items, fileContents, sidebarWidth }} />
    ) : null;
  };

  renderDocstring = () =>
    this.state.definition.docstring ? (
      <div className="definition-docstring">
        <Docstring docstring={this.state.definition.docstring} />
      </div>
    ) : null;

  getCountText = () => null;

  renderCollapseButton = () => null;

  hasResults = () => (this.state.definition.filePath ? true : false);

  getName = () => this.state.definition.name;

  isTriggered = () => (this.state.definition.name ? true : false);
}

function mapStateToProps(state) {
  const { storage, data } = state;
  return {
    storage,
    data
  };
}
export default connect(mapStateToProps)(Definitions);
