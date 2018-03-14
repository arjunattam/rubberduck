import React from "react";
import { connect } from "react-redux";
import { renderChildren } from "./Folder";
import { BaseSection } from "../section";
import "./Tree.css";

class Tree extends BaseSection {
  state = {
    isVisible: this.props.isVisible
  };

  render() {
    // data.fileTree is a recursive tree structure, where every element
    // has children, that denote the subtree
    const children = this.props.data.fileTree.children;
    const renderedChildren = renderChildren(
      children,
      0,
      this.props,
      this.props.data.repoDetails.path
    );
    const styleClass = this.state.isVisible
      ? "tree-content-visible"
      : "tree-content-hidden";

    return (
      <div className="tree-container">
        {this.renderSectionHeader("Files tree")}
        <div className={"tree-content " + styleClass}>{renderedChildren}</div>
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
export default connect(mapStateToProps)(Tree);
