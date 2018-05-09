import React from "react";
import PropTypes from "prop-types";
import BaseSectionItem from "./SectionItem";
import TreeLabel from "../tree/TreeLabel";
import ExpandedCode from "../expanded";

/**
 * Collapsible section titled with file path, and contains usages in that file
 */
class FileSubSection extends React.Component {
  static propTypes = {
    path: PropTypes.string.isRequired,
    link: PropTypes.string.isRequired,
    contents: PropTypes.string.isRequired,
    startLineNumber: PropTypes.number.isRequired,
    items: PropTypes.array.isRequired,
    sidebarWidth: PropTypes.number.isRequired,
    isCollapsed: PropTypes.bool
  };

  state = {
    isHovering: false,
    isCollapsed: false,
    currentLineNumber: 0
  };

  handleMouseEnter = event => {
    this.setState({
      isHovering: true
    });
  };

  handleMouseLeave = event => {
    const rect = this.refs.container.getBoundingClientRect();
    const { clientX: x, clientY: y } = event;
    const { top, bottom, right } = rect;
    const PADDING = 20;
    const isOnCodeSnippet = y < bottom && y > top && x <= right + PADDING;
    const isOutsideWindow = x <= 0;

    if (!isOnCodeSnippet || isOutsideWindow) {
      this.setState({
        isHovering: false
      });
    }
  };

  toggleCollapsed = () => {
    this.setState({ isCollapsed: !this.state.isCollapsed });
  };

  getFilename = () => this.props.path.split("/").slice(-1)[0];

  renderFileTitle = () => {
    return (
      <TreeLabel
        name={this.getFilename()}
        icon={"file"}
        iconColor={"#999"}
        onClick={this.toggleCollapsed}
        hasTriangle={true}
        paddingLeft={12}
        status={this.getLabelStatus()}
      />
    );
  };

  componentWillReceiveProps(newProps) {
    if (newProps.isCollapsed !== this.state.isCollapsed) {
      this.setState({ isCollapsed: newProps.isCollapsed });
    }
  }

  scrollToLine = lineNumber => this.setState({ currentLineNumber: lineNumber });

  renderSectionItem = (item, key) => (
    <BaseSectionItem
      {...item}
      key={key}
      onHover={() => this.scrollToLine(item.lineNumber)}
    />
  );

  getSnippetStyle = () => ({
    left: this.props.sidebarWidth + 2,
    top: this.refs.container
      ? this.refs.container.getBoundingClientRect().top
      : 0
  });

  renderExpandedCode = () => {
    const lineNumbers = this.props.items.map(item => item.lineNumber);
    return this.state.isHovering ? (
      <ExpandedCode
        lineNumbers={lineNumbers}
        filePath={this.props.path}
        baseLink={this.props.link}
        currentLineNumber={this.state.currentLineNumber}
        codeSnippet={this.props.contents}
        startLineNumber={this.props.startLineNumber}
        style={this.getSnippetStyle()}
      />
    ) : null;
  };

  render() {
    const { isCollapsed } = this.state;
    let sectionClassName = "references-file-section";
    sectionClassName += isCollapsed ? " collapsed" : "";

    return (
      <div
        className={sectionClassName}
        onMouseEnter={this.handleMouseEnter}
        onMouseLeave={this.handleMouseLeave}
        ref={"container"}
      >
        {this.renderFileTitle()}
        {isCollapsed ? null : this.renderItems()}
        {isCollapsed ? null : this.renderExpandedCode()}
      </div>
    );
  }
}

export class ReferenceFileSection extends FileSubSection {
  getLabelStatus = () => {
    const count = this.props.items.length;
    return count === 1 ? "1 usage" : `${count} usages`;
  };

  renderItems = () => {
    const referenceItems = this.props.items.map((item, index) =>
      this.renderSectionItem(item, index)
    );
    return <div className="reference-items">{referenceItems}</div>;
  };
}

export class DefinitionFileSection extends FileSubSection {
  getLabelStatus = () => null;

  renderItems = () => (
    <div className="reference-items">
      {this.renderSectionItem(this.props.items[0])}
    </div>
  );
}
