import * as React from "react";
import { connect } from "react-redux";
import TitleBar from "./title";
import StatusBar from "./status";
import BranchInfo from "./branch";

const settingsUrl = () => {
  return `chrome-extension://${chrome.runtime.id}/options.html`;
};

const HEADER_UPPER_STYLE = {
  backgroundColor: "rgb(250, 251, 252)",
  zIndex: 10050,
  position: "relative" as "relative"
};

class Header extends React.Component<any, {}> {
  onClickSettings = () => {
    const url = settingsUrl();
    console.log(url);
    window.open(url);
  };

  render() {
    const { repoDetails, session } = this.props.data;
    return (
      <div>
        <div className="header-upper" style={HEADER_UPPER_STYLE}>
          <TitleBar repoDetails={repoDetails} />

          <StatusBar
            session={session}
            onClick={this.onClickSettings}
            isExpanded={false} // TODO: delete this
          />
        </div>
        <BranchInfo repoDetails={repoDetails} />
      </div>
    );
  }
}

function mapStateToProps(state) {
  const { storage, data } = state;
  return {
    storage,
    data
  };
}
export default connect(mapStateToProps)(Header);
