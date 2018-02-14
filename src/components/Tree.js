import React from "react";
import { API } from "./../utils/api";
import { getChildren } from "./../utils/data";
import { constructPath } from "./../adapters/github/path";
import SectionHeader from "./common/Section";
import "./Tree.css";

const renderChildren = (children, depth, parentProps) => {
  // The parentProps are required to pass org/repo information down
  // the component chain, so that we can construct the link href. Can this be avoided?
  const parents = children
    .filter(element => {
      return element.children.length > 0;
    })
    .sort(function(a, b) {
      return a.name.localeCompare(b.name);
    });
  const onlyChildren = children
    .filter(element => {
      return element.children.length === 0;
    })
    .sort(function(a, b) {
      return a.name.localeCompare(b.name);
    });
  // Expected ordering is first folders, then files, each alphabetical
  children = parents.concat(onlyChildren);

  return (
    <div>
      {children.map(element => {
        if (element.children.length > 0) {
          // Ordering of props is important since the element needs to override
          // the parentProps
          return (
            <Folder
              {...parentProps}
              {...element}
              depth={depth + 1}
              key={element.path}
            />
          );
        } else {
          return (
            <File
              {...parentProps}
              {...element}
              depth={depth + 1}
              key={element.path}
            />
          );
        }
      })}
    </div>
  );
};

class Folder extends React.Component {
  state = {
    isCollapsed: true
  };

  getPadding = () => {
    // padding is a function of depth
    return this.props.depth * 12;
  };

  toggleCollapsed = () => {
    this.setState({ isCollapsed: !this.state.isCollapsed });
  };

  render() {
    const pl = this.getPadding();
    const children = this.props.children;
    const renderedChildren = renderChildren(
      children,
      this.props.depth,
      this.props
    );

    return (
      <div className="file-container">
        <a onClick={this.toggleCollapsed} style={{ paddingLeft: pl }}>
          <span className="monospace">
            {this.state.isCollapsed ? "+ " : "- "}
          </span>
          {this.props.name}
        </a>
        {this.state.isCollapsed ? null : renderedChildren}
      </div>
    );
  }
}

class File extends React.Component {
  getPadding = () => {
    // padding is a function of depth
    return (this.props.depth + 1) * 12;
  };

  render() {
    const pl = this.getPadding();
    const path = constructPath(
      this.props.path,
      this.props.username,
      this.props.reponame,
      this.props.branch
    );
    return (
      <div className="file-container" key={this.props.name}>
        <a href={path} style={{ paddingLeft: pl }}>
          {this.props.name}
        </a>
      </div>
    );
  }
}

export default class Tree extends React.Component {
  state = {
    data: { children: [] },
    isVisible: this.props.isVisible
  };

  updateTree = () => {
    // TODO(arjun): add proper loader
    API.getFilesTree(this.props.username, this.props.reponame)
      .then(response => {
        this.setState({
          data: getChildren(this.props.reponame, response.data.tree)
        });
      })
      .catch(error => {
        // TODO(arjun): this needs to be better communicated
        console.log("Error in API call");
      });
  };

  componentDidMount() {
    this.updateTree();
  }

  componentWillReceiveProps(newProps) {
    if (newProps.isVisible !== this.state.isVisible) {
      this.setState({ isVisible: newProps.isVisible });
      this.updateTree();
    }
  }

  toggleVisibility = () => {
    this.setState({
      isVisible: !this.state.isVisible
    });
  };

  render() {
    // data is a recursive tree structure, where every element
    // has children, that denote the subtree
    const children = this.state.data.children;
    const renderedChildren = renderChildren(children, 0, this.props);

    return (
      <div className="tree-container">
        <SectionHeader
          onClick={this.toggleVisibility}
          isVisible={this.state.isVisible}
          name={"Files tree"}
        />
        {this.state.isVisible ? (
          <div className="tree-content">{renderedChildren}</div>
        ) : null}
      </div>
    );
  }
}
