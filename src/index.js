import React from "react";
import ReactDOM from "react-dom";
import "./index.css";
import Title from "./components/Title";
import Tree from "./components/Tree";
// import registerServiceWorker from "./registerServiceWorker";

class Sidebar extends React.Component {
  render() {
    return (
      <div style={{ overflow: "auto", height: "100%" }}>
        <Title />
        <Tree />
      </div>
    );
  }
}

const anchor = document.createElement("div");
anchor.id = "mercury-sidebar";
document.body.insertBefore(anchor, document.body.childNodes[0]);

ReactDOM.render(<Sidebar />, document.getElementById("mercury-sidebar"));
// registerServiceWorker();
