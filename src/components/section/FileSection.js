import React from "react";
import PropTypes from "prop-types";
import { BaseSectionItem } from "./index";
import TreeLabel from "../tree/TreeLabel";

/**
 * Collapsible section titled with file path, and contains usages in that file
 */
class FileSubSection extends React.Component {
  static propTypes = {
    name: PropTypes.string.isRequired,
    items: PropTypes.array.isRequired,
    sidebarWidth: PropTypes.number.isRequired,
    fileContents: PropTypes.object.isRequired,
    isCollapsed: PropTypes.bool
  };

  state = {
    isCollapsed: false
  };

  toggleCollapsed = () => {
    this.setState({ isCollapsed: !this.state.isCollapsed });
  };

  getFilename = () => this.props.name.split("/").slice(-1)[0];

  getCountText = () => {
    const count = this.props.items.length;
    return count === 1 ? "1 usage" : `${count} usages`;
  };

  renderFileTitle = () => {
    return (
      <TreeLabel
        name={this.getFilename()}
        icon={"file"}
        iconColor={"#999"}
        onClick={this.toggleCollapsed}
        hasTriangle={true}
        paddingLeft={12}
        status={this.getCountText()}
      />
    );
  };

  componentWillReceiveProps(newProps) {
    if (newProps.isCollapsed !== this.state.isCollapsed) {
      this.setState({ isCollapsed: newProps.isCollapsed });
    }
  }

  render() {
    const { isCollapsed } = this.state;
    let sectionClassName = "references-file-section";
    sectionClassName += isCollapsed ? " collapsed" : "";

    return (
      <div className={sectionClassName}>
        {this.renderFileTitle()}
        {isCollapsed ? null : this.renderItems()}
      </div>
    );
  }

  getFileContentsProps = (fileSha, filePath) => {
    const { fileContents } = this.props;
    const baseOrHead = fileSha === "base" ? fileSha : "head";
    const contentsInStore = fileContents[baseOrHead][filePath];

    // Get contents from store if available, else use what we have
    return contentsInStore
      ? { codeSnippet: contentsInStore, startLineNumber: 0 }
      : {};
  };

  renderSectionItem = (item, key) => {
    const { sidebarWidth } = this.props;
    const { fileSha, filePath } = item;
    return (
      <BaseSectionItem
        {...item}
        {...{ key, sidebarWidth }}
        {...this.getFileContentsProps(fileSha, filePath)}
      />
    );
  };
}

export class ReferenceFileSection extends FileSubSection {
  renderItems = () => {
    // TODO(arjun): sort reference items by line number
    const referenceItems = this.props.items.map((item, index) =>
      this.renderSectionItem(item, index)
    );
    return <div className="reference-items">{referenceItems}</div>;
  };
}

export class DefinitionFileSection extends FileSubSection {
  getCountText = () => null;

  renderItems = () => (
    <div className="reference-items">
      {this.renderSectionItem(this.props.items[0])}
    </div>
  );
}
