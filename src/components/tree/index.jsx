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
    const { fileTree: tree } = this.props.data;
    if (tree.children) {
      return treeAdapter.flattenChildren(tree).children;
    }
    return tree.children;
  };

  componentDidUpdate(prevProps, prevState, snapshot) {
    const { isLoading: prevLoading } = prevProps.data.pjax;
    const { isLoading: newLoading } = this.props.data.pjax;
    if (newLoading !== prevLoading) {
      this.DataActions.setTreeLoading(newLoading);
    }
  }

  render() {
    const children = this.flattenSingleDirectory();
    const initialDepth = 0;
    const props = { ...this.props, urlLoader: this.DataActions.loadUrl };
    const renderedChildren = renderChildren(children, initialDepth, props);
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
