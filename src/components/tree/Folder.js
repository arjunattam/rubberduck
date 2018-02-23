import React from "react";
import "./Tree.css";
import File from "./File";
import Octicon from "react-component-octicons";

const sortChildren = children => {
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
  return parents.concat(onlyChildren);
};

export const renderChildren = (children, depth, parentProps) => {
  // The parentProps are required to pass org/repo information down
  // the component chain, so that we can construct the link href. Can this be avoided?
  const childrenToRender = sortChildren(children);
  return (
    <div>
      {childrenToRender.map(element => {
        if (element.children.length > 0) {
          // Ordering of props is important since the element
          // needs to override the parentProps
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
    const selectedName = this.state.isCollapsed ? "" : "file-selected";
    const triangle = this.state.isCollapsed ? (
      <Octicon name="triangle-right" className="file-triangle" />
    ) : (
      <Octicon name="triangle-down" className="file-triangle" />
    );
    const childrenStyle = this.state.isCollapsed
      ? "file-children-collapsed"
      : null;

    return (
      <div>
        <div className={"file-container " + selectedName}>
          <a onClick={this.toggleCollapsed} style={{ paddingLeft: pl }}>
            {triangle}{" "}
            <Octicon
              name="file-directory"
              style={{ height: 15, color: "#8294ac" }}
            />{" "}
            {this.props.name}
          </a>
        </div>
        <div className={"file-children " + childrenStyle}>
          {renderedChildren}
        </div>
      </div>
    );
  }
}
