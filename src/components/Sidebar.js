import React from "react";
import "./../index.css";
import Title from "./Title";
import Tree from "./Tree";
import StatusBar from "./StatusBar";
import CollapseButton from "./CollapseButton";
import References from "./References";
import Definitions from "./Definitions";
import HoverListener from "./Hover";
import { getRepoFromPath } from "./../adapters/github/path";
import { updateLayout } from "./../adapters/github/layout";
// TODO(arjun): move local storage to chrome.storage.local
import { setLocal, getLocal } from "./../utils/storage";
import { addChromeListener } from "./../utils/chrome";

export default class Sidebar extends React.Component {
  state = {
    isVisible: false, // changed by toggleCollapse
    // This state is inferred from the window url
    // TODO(arjun): default state is a problem when we are on a non-repo github page
    username: "requests",
    reponame: "requests",
    type: "blob",
    typeId: "master",
    // TODO(arjun): clean up this state, move repo data to an object
    openSection: this.props.openSection,
    textSelection: {}
  };

  componentDidMount() {
    this.getVisibleState();
    this.setupChromeListener();
    const repo = getRepoFromPath();
    const isEmpty = Object.keys(repo).length === 0;

    if (!isEmpty) {
      this.setState({ ...repo });
    }
  }

  setupChromeListener = () => {
    // Setup the chrome message passing listener for
    // messages from the background.
    addChromeListener(action => {
      const actionSections = {
        REFERENCES_TRIGGER: "references",
        DEFINITIONS_TRIGGER: "definitions"
      };

      const selectionRects = document
        .getSelection()
        .getRangeAt(0)
        .getClientRects();

      if (selectionRects.length > 0) {
        const rect = selectionRects[0];
        const x = rect.left + (rect.right - rect.left) / 2;
        const y = rect.top + (rect.bottom - rect.top) / 2;
        this.setState({
          openSection: actionSections[action],
          textSelection: { x: x, y: y }
        });
      }
    });
  };

  toggleCollapse = () => {
    setLocal("isVisible", !this.state.isVisible);
    this.setState({
      isVisible: !this.state.isVisible
    });
  };

  getVisibleState = () => {
    getLocal("isVisible", value => {
      this.setState({ isVisible: value });
    });
  };

  render() {
    updateLayout(this.state.isVisible, 232); // 232 = sidebar width in pixels

    if (this.state.isVisible) {
      return (
        <div className="mercury-container">
          <Title {...this.state}>
            <CollapseButton onClick={this.toggleCollapse} isVisible={true} />
          </Title>
          <Tree {...this.state} isVisible={this.state.openSection === "tree"} />
          <References
            isVisible={this.state.openSection === "references"}
            selectionX={this.state.textSelection.x}
            selectionY={this.state.textSelection.y}
          />
          <Definitions
            isVisible={this.state.openSection === "definitions"}
            selectionX={this.state.textSelection.x}
            selectionY={this.state.textSelection.y}
          />
          <HoverListener />
          <StatusBar />
        </div>
      );
    } else {
      return <CollapseButton onClick={this.toggleCollapse} isVisible={false} />;
    }
  }
}
