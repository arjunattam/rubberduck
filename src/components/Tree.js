import React from "react";
import { getFilesTree } from "./../utils/api";
import { getChildren } from "./../utils/data";
import { constructPath } from "./../adapters/github/path";
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
          <span className="mono">{this.state.isCollapsed ? "+ " : "- "}</span>
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
      this.props.typeId
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
    isVisible: true
  };

  updateTree = () => {
    // TODO(arjun): add proper loader
    getFilesTree(this.props.username, this.props.reponame)
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

  componentDidUpdate(prevProps) {
    if (prevProps !== this.props) {
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
    if (this.state.isVisible) {
      const children = this.state.data.children;
      const renderedChildren = renderChildren(children, 0, this.props);

      return (
        <div className="tree-container">
          <div className="tree-header" onClick={this.toggleVisibility}>
            ▼ Files tree
          </div>
          <div className="tree-content">{renderedChildren}</div>
        </div>
      );
    } else {
      return (
        <div className="tree-container">
          <div className="tree-header" onClick={this.toggleVisibility}>
            ▷ Files tree
          </div>
        </div>
      );
    }
  }
}
