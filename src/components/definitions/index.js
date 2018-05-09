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

  getDefinitionObject = (apiResult, hoverResult) => {
    const { fileSha } = hoverResult;
    const { definition, docstring } = apiResult;
    const filePath = this.getFilePath(apiResult);
    const lineNumber = this.getLine(apiResult);
    const startLineNumber = this.getStartLine(apiResult);
    const codeSnippet = definition ? definition.contents : "";
    const innerItem = { codeSnippet, lineNumber, startLineNumber };
    return {
      name: apiResult.name || hoverResult.name,
      filePath,
      fileSha,
      fileLink: this.getFileLink(fileSha, filePath),
      docstring,
      items: [innerItem]
    };
  };

  getSelectionData = hoverResult => {
    const isValidResult =
      hoverResult.hasOwnProperty("fileSha") &&
      hoverResult.hasOwnProperty("lineNumber");

    if (isValidResult) {
      this.clearState(hoverResult.name);
      this.DataActions.callDefinitions(hoverResult).then(response => {
        const apiResult = response.value.result;
        const definition = this.getDefinitionObject(apiResult, hoverResult);
        this.setState({ definition: definition }, () =>
          this.fetchDefinitionContents()
        );
      });
    }
  };

  fetchDefinitionContents = () => this.fetchContents(this.state.definition);

  renderItems = () => {
    const fileObject = this.state.definition;
    const { filePath: path, fileLink: link, items } = fileObject;
    const { contents, startLineNumber } = this.getFileContents(fileObject);
    const { sidebarWidth } = this.props.storage;
    return this.hasResults() ? (
      <DefinitionFileSection
        {...{ path, link, items, contents, startLineNumber, sidebarWidth }}
      />
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
