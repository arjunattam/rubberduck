import React from "react";
import { getFilesTree } from "./../utils/api";
import { getChildren, constructPath } from "./../utils/adapters";

const renderChildren = (children, depth, parentProps) => {
  // The parentProps are required to pass org/repo information down
  // the component chain, so that we can construct the link href. Can this be avoided?
  children
    .sort(function(a, b) {
      return a.name > b.name;
    })
    .sort(function(a, b) {
      return a.children.length == 0;
    });
  return (
    <div>
      {children.map(element => {
        if (element.children.length > 0) {
          // Ordering of props is important since the element needs to override
          // the parentProps
          return <Folder {...parentProps} {...element} depth={depth + 1} />;
        } else {
          return <File {...parentProps} {...element} depth={depth + 1} />;
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
      <div style={{ marginTop: "6px" }}>
        <a
          href="#"
          onClick={this.toggleCollapsed}
          style={{ paddingLeft: pl, fontFamily: "monospace" }}
        >
          {this.state.isCollapsed ? "+" : "-"}
        </a>{" "}
        <a href="#" onClick={this.toggleCollapsed}>
          {this.props.name}
        </a>
        {this.state.isCollapsed ? "" : renderedChildren}
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
      <div style={{ marginTop: "6px" }} key={this.props.name}>
        <a href={path} style={{ paddingLeft: pl }}>
          {this.props.name}
        </a>
      </div>
    );
  }
}

export default class Tree extends React.Component {
  state = {
    data: { children: [] }
  };

  componentDidUpdate(prevProps) {
    if (prevProps != this.props) {
      getFilesTree(this.props.username, this.props.reponame)
        .then(response => {
          this.setState({
            data: getChildren(this.props.reponame, response.data.tree)
          });
        })
        .catch(error => {
          console.log("Error in API call");
        });
    }
  }

  render() {
    // data is a recursive tree structure, where every element
    // has children, that denote the subtree
    const children = this.state.data.children;
    const renderedChildren = renderChildren(children, 0, this.props);

    return (
      <div style={{ paddingLeft: "10px", overflow: "auto" }}>
        {renderedChildren}
      </div>
    );
  }
}
