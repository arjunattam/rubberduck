import React from "react";
import ReactDOM from "react-dom";
import "./index.css";
import Title from "./components/Title";
import Tree from "./components/Tree";
import StatusBar from "./components/StatusBar";
import CollapseButton from "./components/CollapseButton";
import HoverListener from "./components/HoverListener";
import { getRepoFromPath } from "./adapters/github/path";
import { updateLayout } from "./adapters/github/layout";
// TODO(arjun): move local storage to chrome.storage.local
import { setLocal, getLocal } from "./utils/storage";
// import registerServiceWorker from "./registerServiceWorker";

class Sidebar extends React.Component {
  state = {
    isValidPage: true,
    isVisible: false, // changed by toggleCollapse
    // This state is inferred from the window url
    // TODO(arjun): default state is a problem when we are on a non-repo github page
    username: "requests",
    reponame: "requests",
    type: "blob",
    typeId: "master"
  };

  componentDidMount() {
    this.getVisibleState();
    const repo = getRepoFromPath();
    // TODO(arjun): branches with '/' are breaking (feature/accounts eg)
    const isEmpty = Object.keys(repo).length === 0;

    if (!isEmpty) {
      this.setState({ ...repo });
    } else {
      // this.setState({ isValidPage: false });
    }
  }

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
    if (!this.state.isValidPage) {
      return null;
    }

    if (this.state.isVisible) {
      return (
        <div className="mercury-container">
          <Title {...this.state}>
            <CollapseButton onClick={this.toggleCollapse} isVisible={true} />
          </Title>
          <Tree {...this.state} />
          <HoverListener url={window.location.pathname} />
          <StatusBar />
        </div>
      );
    } else {
      return <CollapseButton onClick={this.toggleCollapse} isVisible={false} />;
    }
  }
}

const anchor = document.createElement("div");
anchor.id = "mercury-sidebar";
document.body.insertBefore(anchor, document.body.childNodes[0]);

ReactDOM.render(<Sidebar />, document.getElementById("mercury-sidebar"));
// registerServiceWorker();
