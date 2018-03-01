import React from "react";
import { connect } from "react-redux";
import { API } from "../../utils/api";
import { getTreeChildren, getPRChildren } from "../../utils/data";
import SectionHeader from "../common/Section";
import { renderChildren } from "./Folder";
import "./Tree.css";
let Pjax = require("pjax");
let document = window.document;
class Tree extends React.Component {
  state = {
    isVisible: this.props.isVisible
  };

  componentWillReceiveProps(nextProps) {
    if (this.props.isVisible !== nextProps.isVisible) {
      this.setState({
        isVisible: nextProps.isVisible
      });
    }
  }

  toggleVisibility = () => {
    this.setState({
      isVisible: !this.state.isVisible
    });
  };

  render() {
    // data.fileTree is a recursive tree structure, where every element
    // has children, that denote the subtree
    const children = this.props.data.fileTree.children;
    const renderedChildren = renderChildren(children, 0, this.props);
    const styleClass = this.state.isVisible
      ? "tree-content-visible"
      : "tree-content-hidden";

    return (
      <div className="tree-container">
        <SectionHeader
          onClick={() => this.toggleVisibility()}
          isVisible={this.state.isVisible}
          name={"Files tree"}
        />
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
