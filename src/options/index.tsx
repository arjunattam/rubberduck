import * as React from "react";
import * as ReactDOM from "react-dom";
import { InternalConfig } from "./config";
import { InfoSection } from "./info";
import { AuthSection } from "./auth";
import { NativeAppSection } from "./native";
import { getLatestVersion } from "./utils";
import { GitInfoSection } from "./git";

class App extends React.Component<{}, any> {
  state = {
    isNativeConnected: false,
    latestVersion: undefined,
    currentVersion: undefined,
    runningServers: [],
    gitInfoData: undefined,
    infoData: {}
  };

  componentDidMount() {
    chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
      const { action, data } = message;

      switch (action) {
        case "NATIVE_DISCONNECTED":
          this.setState({ isNativeConnected: false });
          break;
        case "NATIVE_CONNECTED":
          this.setState({ isNativeConnected: true });
          break;
      }
    });

    chrome.runtime.sendMessage(
      { message: "NATIVE_INFO", data: {} },
      (result: INativeInfoMessage) => {
        const port = result.port;
        this.setState({
          infoData: result,
          isNativeConnected: port.isConnected,
          currentVersion: result.version,
          runningServers: result.servers,
          gitInfoData: result.git
        });
      }
    );

    getLatestVersion().then(version =>
      this.setState({ latestVersion: version })
    );
  }

  render() {
    return (
      <>
        <h1>Rubberduck</h1>
        <NativeAppSection
          isConnected={this.state.isNativeConnected}
          currentVersion={this.state.currentVersion}
          latestVersion={this.state.latestVersion}
        />
        <GitInfoSection data={this.state.gitInfoData} />
        <AuthSection />
        <InfoSection data={this.state.infoData} />
        <InternalConfig />
      </>
    );
  }
}

export default App;

ReactDOM.render(<App />, document.getElementById("root"));
