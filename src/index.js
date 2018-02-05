import React from "react";
import ReactDOM from "react-dom";
import "./index.css";
// import App from "./App";
import registerServiceWorker from "./registerServiceWorker";

class Sidebar extends React.Component {
  render() {
    return (
      <div
        style={{
          width: "200px",
          background: "#000",
          color: "#fff",
          height: "100%"
        }}
      >
        Sidebar
      </div>
    );
  }
}

const anchor = document.createElement("div");
anchor.id = "mercuryContainer";
document.body.insertBefore(anchor, document.body.childNodes[0]);

ReactDOM.render(<Sidebar />, document.getElementById("mercuryContainer"));
// registerServiceWorker();
