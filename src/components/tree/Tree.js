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
    data: { children: [] },
    isVisible: this.props.isVisible
  };

  updateTree = () => {
    // TODO(arjun): add proper loader
    let repoDetails = this.props.data.repoDetails;

    if (repoDetails.username && repoDetails.reponame) {
      // Repo details have been figured
      const { username, reponame } = repoDetails;

      if (repoDetails.type === "pull") {
        // We are on a PR page, will get PR files tree
        const pullId = repoDetails.typeId;
        API.getPRFiles(username, reponame, pullId)
          .then(response => {
            this.setState({
              data: getPRChildren(reponame, response)
            });
          })
          .catch(error => {
            // TODO(arjun): this needs to be better communicated
            console.log("Error in API call", error);
          });
      } else {
        // We are on normal files page, will get normal files tree
        const branch = repoDetails.branch || "master";
        API.getFilesTree(username, reponame, branch)
          .then(response => {
            this.setState({
              data: getTreeChildren(reponame, response.tree)
            });
          })
          .catch(error => {
            // TODO(arjun): this needs to be better communicated
            console.log("Error in API call", error);
          });
      }
    }
  };

  componentDidMount() {
    if (this.props.storage.token) {
      // We have the jwt, so make API call
      this.updateTree();
    }
  }

  componentWillReceiveProps(nextProps) {
    if (this.props.isVisible !== nextProps.isVisible) {
      this.setState({
        isVisible: nextProps.isVisible
      });
    }

    if (this.props.storage.token !== nextProps.storage.token) {
      // jwt will be updated, so refresh the tree
      if (nextProps.storage.token) this.updateTree();
    }
  }

  componentDidUpdate(prevProps, prevState) {
    if (!prevState.isVisible && this.state.isVisible) {
      this.updateTree();
    }
    if (
      prevState.data.children.length === 0 &&
      this.state.data.children.length > 0
    ) {
      let pjax = new Pjax({
        elements: "a", // default is "a[href], form[action]"
        selectors: ["#js-repo-pjax-container"],
        cacheBust: false,
        disablePjaxHeader: true
      });
    }
  }

  toggleVisibility = () => {
    this.setState(
      {
        isVisible: !this.state.isVisible
      },
      () => {
        if (this.state.isVisible) {
          this.updateTree();
        }
      }
    );
  };

  render() {
    // data is a recursive tree structure, where every element
    // has children, that denote the subtree
    const children = this.state.data.children;
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
