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

  getSelectionData = async hoverResult => {
    const isValidResult =
      hoverResult.hasOwnProperty("fileSha") &&
      hoverResult.hasOwnProperty("lineNumber");

    if (isValidResult) {
      const params = {
        // TODO: also setup for base --> check via hoverResult
        repo: this.props.data.view.head,
        query: {
          path: hoverResult.filePath,
          line: hoverResult.lineNumber,
          character: hoverResult.charNumber
        }
      };
      await this.DataActions.callDefinitions(params, hoverResult);
    }
  };

  renderItems = () => {
    const fileObject = this.props.data.definition;
    const { filePath: path, fileSha, items } = fileObject;
    const { contents, startLineNumber } = this.getFileContents(fileObject);
    const { sidebarWidth } = this.props.storage;
    const onHover = () => {};
    const link = this.getFileLink(fileSha, path);
    return this.hasResults() ? (
      <DefinitionFileSection
        {...{
          path,
          link,
          items,
          contents,
          startLineNumber,
          sidebarWidth,
          onHover
        }}
      />
    ) : null;
  };

  renderDocstring = () => {
    const { docstring } = this.props.data.definition;
    return docstring ? (
      <div className="definition-docstring">
        <Docstring docstring={docstring} />
      </div>
    ) : null;
  };

  getCountText = () => null;

  renderCollapseButton = () => null;

  hasResults = () => (this.props.data.definition.filePath ? true : false);

  getName = () => this.props.data.definition.name;

  isTriggered = () => (this.props.data.definition.name ? true : false);
}

function mapStateToProps(state) {
  const { storage, data } = state;
  return {
    storage,
    data
  };
}
export default connect(mapStateToProps)(Definitions);
