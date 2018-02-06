import React from "react";
import ReactDOM from "react-dom";
import "./index.css";
import Title from "./components/Title";
import Tree from "./components/Tree";
import StatusBar from "./components/StatusBar";
// import registerServiceWorker from "./registerServiceWorker";
import { getRepoFromPath } from "./utils/adapters";

class Sidebar extends React.Component {
  state = {
    // This state is inferred from the window url
    username: "requests",
    reponame: "requests",
    type: "blob",
    typeId: "master"
  };

  componentDidMount() {
    const repo = getRepoFromPath();

    if (repo != {}) {
      this.setState({ ...repo });
    }
  }

  render() {
    return (
      <div style={{ overflow: "auto", height: "100%" }}>
        <Title {...this.state} />
        <Tree {...this.state} />
        <StatusBar />
      </div>
    );
  }
}

const anchor = document.createElement("div");
anchor.id = "mercury-sidebar";
document.body.insertBefore(anchor, document.body.childNodes[0]);

ReactDOM.render(<Sidebar />, document.getElementById("mercury-sidebar"));
// registerServiceWorker();
