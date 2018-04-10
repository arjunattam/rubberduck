import React from "react";
import { connect } from "react-redux";
import { bindActionCreators } from "redux";
import * as DataActions from "../../actions/dataActions";
import * as StorageActions from "../../actions/storageActions";
import * as StorageUtils from "../../utils/storage";
import Title from "../title/Title";
import StatusBar from "../status/StatusBar";
import CollapseButton from "../collapse/CollapseButton";
import Tree from "../tree";
import References from "../references";
import Definitions from "../definitions";
import HoverListener from "../hover/HoverListener";
import SessionStatus from "../session";
import * as GithubLayout from "../../adapters/github/layout";
import Resizable from "./Resizable";
import "../../index.css";

class Sidebar extends React.Component {
  constructor(props) {
    super(props);
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

  updateStorage = data => {
    StorageUtils.setAllInStore(data);
  };

  toggleCollapse() {
    if (this.props.storage.isSidebarVisible) {
      // To trigger the left slide animation, we follow this:
      // https://css-tricks.com/restart-css-animation/#article-header-id-0
      this.triggerReflow();
      setTimeout(() => {
        this.updateStorage({ isSidebarVisible: false });
      }, 180);
    } else {
      this.updateStorage({ isSidebarVisible: true });
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

  renderTree = () => <Tree />;

  renderReferences = () => (
    <References
      selectionX={this.props.data.textSelection.x}
      selectionY={this.props.data.textSelection.y}
    />
  );

  renderDefinitions = () => (
    <Definitions
      selectionX={this.props.data.textSelection.x}
      selectionY={this.props.data.textSelection.y}
    />
  );

  onResize = (e, direction, ref, delta, position) => {
    this.updateStorage({ sidebarWidth: ref.offsetWidth });
  };

  updatePageLayout = () => {
    const { isSidebarVisible, sidebarWidth } = this.props.storage;
    GithubLayout.updateLayout(isSidebarVisible, sidebarWidth);
  };

  renderCollapseButton = () => (
    <CollapseButton
      onClick={() => this.toggleCollapse()}
      isVisible={this.props.storage.isSidebarVisible}
      sidebarWidth={this.props.storage.sidebarWidth}
    />
  );

  renderSidebar = () => (
    <Resizable width={this.props.storage.sidebarWidth} onResize={this.onResize}>
      <Title />
      {this.renderCollapseButton()}
      <div className="repo-info-sections">
        <SessionStatus />
        {this.renderTree()}
        {this.renderDefinitions()}
        {this.renderReferences()}
      </div>
      <HoverListener />
      <StatusBar />
    </Resizable>
  );

  render() {
    this.updatePageLayout();
    return this.props.storage.isSidebarVisible
      ? this.renderSidebar()
      : this.renderCollapseButton();
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
