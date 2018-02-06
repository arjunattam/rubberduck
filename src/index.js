import React from "react";
import ReactDOM from "react-dom";
import "./index.css";
import Title from "./components/Title";
import Tree from "./components/Tree";
import StatusBar from "./components/StatusBar";
import CollapseButton from "./components/CollapseButton";
// import registerServiceWorker from "./registerServiceWorker";
import { getRepoFromPath, updateLayout } from "./utils/adapters";
import { setLocal, getLocal } from "./utils/storage";

class Sidebar extends React.Component {
  state = {
    isVisible: false, // changed by toggleCollapse
    // This state is inferred from the window url
    username: "requests",
    reponame: "requests",
    type: "blob",
    typeId: "master"
  };

  componentDidMount() {
    this.getVisibleState();
    const repo = getRepoFromPath();

    if (repo !== {}) {
      this.setState({ ...repo });
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
    updateLayout(this.state.isVisible, 232);

    if (this.state.isVisible) {
      return (
        <div className="container">
          <Title {...this.state}>
            <CollapseButton onClick={this.toggleCollapse} isVisible={true} />
          </Title>
          <Tree {...this.state} />
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
