import React from "react";
import { connect } from "react-redux";
import { bindActionCreators } from "redux";
import * as DataActions from "../../actions/dataActions";
import * as StorageActions from "../../actions/storageActions";
import * as StorageUtils from "../../utils/storage";
import Header from "header";
import CollapseButton from "collapse/CollapseButton";
import Tree from "tree";
import References from "references";
import Definitions from "definitions";
import HoverListener from "hover/HoverListener";
import * as GithubLayout from "../../adapters/github/layout";
import { setupPjax } from "./pjax";
import Resizable from "./Resizable";
import "./index.css";

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

  updateStorage = data => StorageUtils.setInSyncStore(data);

  componentDidMount() {
    setupPjax();
  }

  toggleCollapse() {
    if (this.props.storage.isSidebarVisible) {
      // To trigger the left slide animation, we follow this:
      // https://css-tricks.com/restart-css-animation/#article-header-id-0
      this.triggerReflow();
      setTimeout(() => {
        this.updateStorage({ isSidebarVisible: false });
      }, 150);
    } else {
      this.updateStorage({ isSidebarVisible: true });
      setupPjax();
    }
  }

  hasRepoDetails() {
    return (
      this.props.data.repoDetails.username &&
      this.props.data.repoDetails.reponame
    );
  }

  onResize = (event, direction, ref, delta, position) => {
    this.DataActions.updateData({ sidebarWidth: ref.offsetWidth });
  };

  onResizeStop = (event, direction, ref, delta, position) => {
    this.updateStorage({ sidebarWidth: ref.offsetWidth });
  };

  updatePageLayout = (isVisible, width) => {
    GithubLayout.updateLayout(isVisible, width);
  };

  renderCollapseButton = width => (
    <CollapseButton
      onClick={() => this.toggleCollapse()}
      isVisible={this.props.storage.isSidebarVisible}
      sidebarWidth={width}
    />
  );

  renderSidebar = width => (
    <Resizable
      width={width}
      onResize={this.onResize}
      onResizeStop={this.onResizeStop}
    >
      <Header />
      {this.renderCollapseButton(width)}
      <div className="repo-info-sections">
        <Tree />
        <Definitions />
        <References />
      </div>
      <HoverListener />
    </Resizable>
  );

  getWidth = () =>
    this.props.data.data.sidebarWidth > 0
      ? this.props.data.data.sidebarWidth
      : this.props.storage.sidebarWidth;

  hasSidebarRendered = () => {
    const { reponame } = this.props.data.repoDetails;
    const { initialized } = this.props.storage;
    const isNameValid = reponame !== null && reponame !== undefined;
    return initialized && isNameValid;
  };

  render() {
    // The sidebar can have 3 states
    //    1. nothing at all (on eg, https://github.com/django/daphne/pulse)
    //    2. rendered, but collapsed (only shows collapse button)
    //    3. rendered, and expanded (shows full sidebar)
    const shouldRenderSidebar = this.hasSidebarRendered();
    const { isSidebarVisible: isExpanded } = this.props.storage;
    const width = this.getWidth();
    let renderOutput = null;

    if (shouldRenderSidebar) {
      renderOutput = isExpanded
        ? this.renderSidebar(width)
        : this.renderCollapseButton(width);
    }

    this.updatePageLayout(shouldRenderSidebar && isExpanded, width);
    return renderOutput;
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
