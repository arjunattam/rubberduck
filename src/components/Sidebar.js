import React from "react";
import { connect } from "react-redux";
import { bindActionCreators } from "redux";
import "./../index.css";
import * as DataActions from "../actions/dataActions";
import * as StorageActions from "../actions/storageActions";
import * as StorageUtils from "../utils/storage";
import Title from "./title/Title";
import StatusBar from "./status/StatusBar";
import CollapseButton from "./collapse/CollapseButton";
import Tree from "./tree";
import References from "./references";
import Definitions from "./definitions";
import HoverListener from "./hover/HoverListener";
import SessionStatus from "./session";
import * as GithubLayout from "./../adapters/github/layout";

const SIDEBAR_WIDTH = 232; // pixels

class Sidebar extends React.Component {
  constructor(props) {
    super(props);
    this.state = {};
    this.DataActions = bindActionCreators(DataActions, this.props.dispatch);
    this.StorageActions = bindActionCreators(
      StorageActions,
      this.props.dispatch
    );
  }

  triggerReflow = () => {
    const element = document.querySelector(
      "#mercury-sidebar .sidebar-container"
    );
    element.classList.remove("will-slide-right");
    element.classList.add("will-slide-left");
  };

  toggleCollapse() {
    if (this.props.storage.isSidebarVisible) {
      // To trigger the left slide animation, we follow this:
      // https://css-tricks.com/restart-css-animation/#article-header-id-0
      this.triggerReflow();
      setTimeout(() => {
        StorageUtils.setAllInStore({ isSidebarVisible: false });
      }, 190);
    } else {
      StorageUtils.setAllInStore({ isSidebarVisible: true });
    }
  }

  hasRepoDetails() {
    return (
      this.props.data.repoDetails.username &&
      this.props.data.repoDetails.reponame
    );
  }

  renderCollapseButton() {
    return (
      <CollapseButton
        onClick={() => this.toggleCollapse()}
        isVisible={this.props.storage.isSidebarVisible}
      />
    );
  }

  renderTitle() {
    return (
      <Title>
        <CollapseButton
          onClick={() => this.toggleCollapse()}
          isVisible={this.props.storage.isSidebarVisible}
        />
      </Title>
    );
  }

  renderTree() {
    if (this.hasRepoDetails()) {
      return <Tree isVisible={this.props.data.openSection === "tree"} />;
    }
  }

  renderReferences() {
    return (
      <References
        isVisible={this.props.data.openSection === "references"}
        selectionX={this.props.data.textSelection.x}
        selectionY={this.props.data.textSelection.y}
      />
    );
  }

  renderDefinitions() {
    return (
      <Definitions
        isVisible={this.props.data.openSection === "definitions"}
        selectionX={this.props.data.textSelection.x}
        selectionY={this.props.data.textSelection.y}
      />
    );
  }

  render() {
    const { isSidebarVisible } = this.props.storage;
    GithubLayout.updateLayout(isSidebarVisible, SIDEBAR_WIDTH);

    if (isSidebarVisible) {
      return (
        <div className="sidebar-container will-slide-right">
          {this.renderTitle()}
          <div className="repo-info-sections">
            <SessionStatus />
            {this.renderTree()}
            {this.renderReferences()}
            {this.renderDefinitions()}
          </div>
          <HoverListener />
          <StatusBar />
        </div>
      );
    } else {
      return (
        <CollapseButton
          onClick={() => this.toggleCollapse()}
          isVisible={false}
        />
      );
    }
  }
}

function mapStateToProps(state) {
  const { storage, data } = state;
  return {
    storage,
    data
  };
}
export default connect(mapStateToProps)(Sidebar);
