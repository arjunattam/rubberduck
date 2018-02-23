import React from "react";
import { connect } from "react-redux";
import { API } from "../../utils/api";
import { getChildren } from "../../utils/data";
import SectionHeader from "../common/Section";
import { renderChildren } from "./Folder";
import "./Tree.css";

class Tree extends React.Component {
  state = {
    data: { children: [] },
    isVisible: this.props.isVisible
  };

  updateTree = () => {
    // TODO(arjun): add proper loader
    let repoDetails = this.props.data.repoDetails;
    if (repoDetails.username && repoDetails.reponame) {
      const branch = repoDetails.branch || "master";
      API.getFilesTree(repoDetails.username, repoDetails.reponame, branch)
        .then(response => {
          this.setState({
            data: getChildren(repoDetails.reponame, response.data.tree)
          });
        })
        .catch(error => {
          // TODO(arjun): this needs to be better communicated
          console.log("Error in API call");
        });
    }
  };

  componentDidMount() {
    this.updateTree();
  }

  componentWillReceiveProps(nextProps) {
    if (this.props.isVisible !== nextProps.isVisible) {
      this.setState({
        isVisible: nextProps.isVisible
      });
    }
  }

  componentDidUpdate(prevProps, prevState) {
    if (!prevState.isVisible && this.state.isVisible) {
      this.updateTree();
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
    const contentStyle = this.state.isVisible
      ? {
          maxHeight: "calc(100vh - 207px)",
          paddingBottom: 10
        }
      : {
          maxHeight: 0,
          padding: 0,
          overflow: "hidden"
        };

    return (
      <div className="tree-container">
        <SectionHeader
          onClick={() => this.toggleVisibility()}
          isVisible={this.state.isVisible}
          name={"Files tree"}
        />
        <div className="tree-content" style={contentStyle}>
          {renderedChildren}
        </div>
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
