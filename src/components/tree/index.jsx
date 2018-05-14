import React from "react";
import { connect } from "react-redux";
import { renderChildren } from "./Folder";
import { BaseSection } from "../section";
import { treeAdapter, isCompareView } from "../../adapters";
import "./Tree.css";

class Tree extends BaseSection {
  sectionName = "tree";

  getSectionTitle = () => (isCompareView() ? "files changed" : "files tree");

  flattenSingleDirectory = () => {
    // Flatten the tree when there is a chain of single directories (often found in Java)
    // For example, src/org/eclipse/ls/...
    const tree = this.props.data.fileTree;
    if (tree.children) {
      console.log(tree.children);
      return treeAdapter.flattenChildren(tree).children;
    }
    return tree.children;
  };

  componentDidMount() {
    document.addEventListener("pjax:send", () => this.onPjaxStart());
    document.addEventListener("pjax:complete", () => this.onPjaxEnd());
  }

  onPjaxStart = () => {
    this.DataActions.setTreeLoading(true);
  };

  onPjaxEnd = () => {
    this.DataActions.setTreeLoading(false);
  };

  render() {
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
        {this.renderSectionHeader()}
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
