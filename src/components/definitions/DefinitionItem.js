import React from "react";
import { BaseSectionItem } from "../section";
import ExpandedCode from "../common/ExpandedCode";
import CodeNode from "../common/CodeNode";
import Docstring from "../common/Docstring";

export default class DefinitionItem extends BaseSectionItem {
  renderDocstring = () =>
    this.props.docstring ? (
      <div className="definition-docstring">
        <Docstring docstring={this.props.docstring} />
      </div>
    ) : null;

  render() {
    return (
      <div
        className="definition-item"
        onMouseEnter={this.handleMouseEnter}
        onMouseLeave={this.handleMouseLeave}
        ref={"container"}
      >
        <CodeNode {...this.props} children={this.renderDocstring()} />

        {this.state.isHovering ? (
          <ExpandedCode {...this.props} top={this.getTop()} />
        ) : null}
      </div>
    );
  }
}
