import React from "react";
import ReactDOM from "react-dom";
import ReactJson from "react-json-view";
import { ExistingOptions } from "./config";
import { AuthSection } from "./auth";

class InfoSection extends React.Component {
  state = {
    data: undefined
  };

  componentDidMount() {
    chrome.runtime.sendMessage({ message: "NATIVE_INFO", data: {} }, result => {
      this.setState({ data: result });
    });
  }

  render() {
    return (
      <div>
        <h2>Info</h2>
        <ReactJson
          style={{ fontSize: 16 }}
          src={this.state.data}
          name={false}
          enableClipboard={false}
          displayDataTypes={false}
        />
      </div>
    );
  }
}

class App extends React.Component {
  render() {
    return (
      <div>
        <h1>Rubberduck</h1>
        <ExistingOptions />
        <AuthSection />
        <InfoSection />
      </div>
    );
  }
}

export default App;

ReactDOM.render(<App />, document.getElementById("root"));
