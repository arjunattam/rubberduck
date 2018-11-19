import React from "react";
import { connect } from "react-redux";
import TitleBar from "./title";
import Settings from "./settings";
import StatusBar from "./status";
import BranchInfo from "./branch";

const HEADER_UPPER_STYLE = {
  backgroundColor: "rgb(250, 251, 252)",
  zIndex: 10050,
  position: "relative"
};

class Header extends React.Component {
  state = {
    isSettingsExpanded: false
  };

  toggleSettings = () => {
    this.setState({ isSettingsExpanded: !this.state.isSettingsExpanded });
  };

  render() {
    const { repoDetails, session } = this.props.data;
    const { isSettingsExpanded } = this.state;
    return (
      <div>
        <div className="header-upper" style={HEADER_UPPER_STYLE}>
          <TitleBar repoDetails={repoDetails} />
          <StatusBar
            session={session}
            onClick={this.toggleSettings}
            isExpanded={isSettingsExpanded}
          />
          <Settings isVisible={isSettingsExpanded} {...this.props} />
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
