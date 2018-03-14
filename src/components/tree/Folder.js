import React from "react";
import File from "./File";
import TreeLabel from "./TreeLabel";
import Octicon from "react-component-octicons";

const PADDING_CONST = 12; // in pixels

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

export const renderChildren = (children, depth, parentProps, currentPath) => {
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
              currentPath={currentPath}
            />
          );
        } else {
          return (
            <File
              {...parentProps}
              {...element}
              depth={depth + 1}
              key={element.path}
              currentPath={currentPath}
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
    return this.props.depth * PADDING_CONST;
  };

  toggleCollapsed = () => {
    this.setState({ isCollapsed: !this.state.isCollapsed });
  };

  renderFolderStructure = () => {
    const children = this.props.children;
    const renderedChildren = renderChildren(
      children,
      this.props.depth,
      this.props,
      this.props.currentPath
    );
    return <div className="file-children">{renderedChildren}</div>;
  };

  isCurrentlyOpen = () => {
    return (
      this.props.currentPath &&
      this.props.currentPath.indexOf(this.props.path) >= 0
    );
  };

  componentDidMount() {
    this.setState({
      isCollapsed: !this.isCurrentlyOpen()
    });
  }

  render() {
    const pl = this.getPadding();
    const triangle = (
      <Octicon name={"triangle-down"} className="file-triangle" />
    );
    let containerClassName = "folder-structure-container";
    containerClassName += this.state.isCollapsed ? " collapsed" : "";

    return (
      <div className={containerClassName}>
        <div className={"file-container"}>
          <a onClick={this.toggleCollapsed} style={{ paddingLeft: pl }}>
            {triangle}{" "}
            <TreeLabel
              {...this.props}
              icon="file-directory"
              iconColor="#8294ac"
            />
          </a>
        </div>
        {this.state.isCollapsed ? null : this.renderFolderStructure()}
      </div>
    );
  }
}
