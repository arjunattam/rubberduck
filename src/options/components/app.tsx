import * as React from "react";
import { InternalConfig } from "./config";
import { AuthSection } from "./auth";
import { NativeAppSection } from "./native";
import { getLatestVersion } from "./utils";
import { ReposSection } from "./repos";
import { Title } from "./title";

class App extends React.Component<{}, any> {
  state = {
    isNativeConnected: false,
    latestVersion: undefined,
    currentVersion: undefined,
    runningServers: [],
    gitInfoData: undefined
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
          this.fetchNativeInfo();
          break;
      }
    });
    getLatestVersion().then(version =>
      this.setState({ latestVersion: version })
    );
    this.fetchNativeInfo();
  }

  fetchNativeInfo = () => {
    chrome.runtime.sendMessage(
      { message: "NATIVE_INFO", data: {} },
      (result: INativeInfoMessage) => {
        const port = result.port;
        this.setState({
          isNativeConnected: port.isConnected,
          currentVersion: result.version,
          runningServers: result.servers,
          gitInfoData: result.git
        });
      }
    );
  };

  installUpdate = () => {
    chrome.runtime.sendMessage(
      { message: "NATIVE_INSTALL_UPDATE", data: {} },
      () => console.log("update callback")
    );
  };

  clearAllRepos = () => {
    return new Promise((resolve, reject) => {
      chrome.runtime.sendMessage(
        { message: "NATIVE_REMOVE_ALL", data: {} },
        result => {
          this.fetchNativeInfo();
          resolve(result);
        }
      );
    });
  };

  render() {
    return (
      <div className="container py-4">
        <Title />
        <NativeAppSection
          isConnected={this.state.isNativeConnected}
          currentVersion={this.state.currentVersion}
          latestVersion={this.state.latestVersion}
          onInstallUpdate={() => this.installUpdate()}
        />
        <ReposSection
          data={this.state.gitInfoData}
          onClearAll={() => this.clearAllRepos()}
        />
        <AuthSection />
        <InternalConfig />
      </div>
    );
  }
}

export default App;
