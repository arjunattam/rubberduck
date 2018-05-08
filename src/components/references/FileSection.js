import React from "react";
import ReferenceItem from "./ReferenceItem";
import TreeLabel from "../tree/TreeLabel";

/**
 * Collapsible section titled with file path, and contains usages in that file
 */
export default class FileSection extends React.Component {
  state = {
    isCollapsed: false
  };

  toggleCollapsed = () => {
    this.setState({ isCollapsed: !this.state.isCollapsed });
  };

  getFilename = () => this.props.name.split("/").slice(-1)[0];

  renderFileTitle = () => {
    return (
      <TreeLabel
        name={this.getFilename()}
        icon={"file"}
        iconColor={"#999"}
        onClick={this.toggleCollapsed}
        hasTriangle={true}
        paddingLeft={12}
        status={this.props.items.length}
      />
    );
  };

  renderItems = () => {
    const { sidebarWidth, fileContents } = this.props;
    // TODO(arjun): sort reference items by line number
    const referenceItems = this.props.items.map((reference, index) => {
      const { fileSha, filePath } = reference;
      const baseOrHead = fileSha === "base" ? fileSha : "head";
      const contentsInStore = fileContents[baseOrHead][filePath];

      // Get contents from store if available, else use what we have
      const fileProps = contentsInStore
        ? { codeSnippet: contentsInStore, startLineNumber: 0 }
        : {};

      return (
        <ReferenceItem
          {...reference}
          key={index}
          sidebarWidth={sidebarWidth}
          {...fileProps}
        />
      );
    });
    return <div className="reference-items">{referenceItems}</div>;
  };

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
}
