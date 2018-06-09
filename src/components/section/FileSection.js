import React from "react";
import PropTypes from "prop-types";
import BaseSectionItem from "./SectionItem";
import TreeLabel from "../tree/TreeLabel";
import ExpandedCode from "../expanded";
import * as AnalyticsUtils from "../../utils/analytics";

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
    onHover: PropTypes.func.isRequired,
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
    AnalyticsUtils.logExpandedCodeShow();
    return this.props.onHover();
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
    if (newProps.isParentCollapsed !== this.props.isParentCollapsed) {
      this.setState({ isCollapsed: newProps.isParentCollapsed });
    }
  }

  componentDidMount() {
    if (this.props.isParentCollapsed !== this.state.isCollapsed) {
      this.setState({ isCollapsed: this.props.isParentCollapsed });
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

  handleMouseOver = event => {
    const { clientY: mouseY, clientX: mouseX } = event;
    const { sidebarWidth } = this.props;
    const isMovingOnFileSection = mouseX < sidebarWidth;
    const hasNoValue = !this.state.mouseY;
    const isDeltaLarge = Math.abs(mouseY - this.state.mouseY) >= 100;

    if (isMovingOnFileSection) {
      if (hasNoValue || isDeltaLarge) {
        this.setState({ mouseY });
      }
    }
  };

  getSnippetStyle = () => {
    const { mouseY } = this.state;
    const top = mouseY ? Math.max(mouseY - 200, 25) : 25;
    return {
      left: this.props.sidebarWidth + 2,
      top
    };
  };

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
        onMouseOver={this.handleMouseOver}
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
