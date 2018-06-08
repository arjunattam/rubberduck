import React from "react";
import File from "./File";
import TreeLabel from "./TreeLabel";
import { isCompareView } from "../../adapters";
const PADDING_CONST = 12; // in pixels
const COMPARE_VIEW_OPEN_DEPTH = 3;

const isFolder = element => element.children.length > 0;

const alphabetSort = (a, b) => a.name.localeCompare(b.name);

const sortChildren = children => {
  const parents = children
    .filter(element => isFolder(element))
    .sort(alphabetSort);
  const onlyChildren = children
    .filter(element => !isFolder(element))
    .sort(alphabetSort);
  return parents.concat(onlyChildren);
};

export const renderChildren = (children, depth, parentProps) => {
  // The parentProps are required to pass org/repo information down
  // the component chain, so that we can construct the link href. Can this be avoided?
  const childrenToRender = children ? sortChildren(children) : [];
  return (
    <div>
      {childrenToRender.map(element => {
        // Ordering of props is important since the element
        // needs to override the parentProps
        const childProps = {
          ...parentProps,
          ...element,
          depth: depth + 1,
          key: element.path
        };
        return isFolder(element) ? (
          <Folder {...childProps} />
        ) : (
          <File {...childProps} />
        );
      })}
    </div>
  );
};

class Folder extends React.Component {
  state = {
    isCollapsed: true
  };

  getPadding = () => this.props.depth * PADDING_CONST;

  toggleCollapsed = () =>
    this.setState({ isCollapsed: !this.state.isCollapsed });

  renderFolderStructure = () => {
    const children = this.props.children;
    const { depth } = this.props;
    const renderedChildren = renderChildren(children, depth, this.props);
    return <div className="file-children">{renderedChildren}</div>;
  };

  isCurrentlyOpen = () => {
    const { path: currentPath } = this.props.data.repoDetails;
    return currentPath && currentPath.indexOf(this.props.path) >= 0;
  };

  componentDidMount() {
    let isCollapsed = true;
    if (isCompareView()) {
      if (this.props.depth < COMPARE_VIEW_OPEN_DEPTH) {
        isCollapsed = false;
      }
    } else {
      isCollapsed = !this.isCurrentlyOpen();
    }
    this.setState({
      isCollapsed
    });
  }

  renderFolderLabel = () => (
    <TreeLabel
      {...this.props}
      onClick={this.toggleCollapsed}
      paddingLeft={this.getPadding()}
      icon="file-directory"
      iconColor="#8294ac"
      hasTriangle={true}
    />
  );

  render() {
    const { isCollapsed } = this.state;
    let containerClassName = "folder-structure-container";
    containerClassName += isCollapsed ? " collapsed" : "";

    return (
      <div className={containerClassName}>
        {this.renderFolderLabel()}
        {isCollapsed ? null : this.renderFolderStructure()}
      </div>
    );
  }
}
