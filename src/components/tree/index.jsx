import React from "react";
import { connect } from "react-redux";
import { renderChildren } from "./Folder";
import { BaseSection } from "../section";
import { treeAdapter } from "../../adapters";
import "./Tree.css";

class Tree extends BaseSection {
  sectionName = "tree";

  flattenSingleDirectory = () => {
    // This method flattens the tree in the case when there is a chain
    // of single directories.
    // For example, src/org/eclipse/ls/... (often found in Java)
    const tree = this.props.data.fileTree;
    if (tree.children) {
      return treeAdapter.flattenChildren(tree).children;
    }
    return tree.children;
  };

  render() {
    // data.fileTree is a recursive tree structure, where every element
    // has children, that denote the subtree
    const children = this.flattenSingleDirectory();
    const renderedChildren = renderChildren(
      children,
      0,
      this.props,
      this.props.data.repoDetails.path
    );
    const styleClass = this.isVisible()
      ? "tree-content-visible"
      : "tree-content-hidden";

    return (
      <div className="tree-container">
        {this.renderSectionHeader("Files tree")}
        <div
          className={"tree-content " + styleClass}
          children={renderedChildren}
        />
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
