import React from "react";
import { connect } from "react-redux";
import TitleBar from "./title";
import Settings from "./settings";
import StatusBar from "./status";
import BranchInfo from "./branch";

class Header extends React.Component {
  state = {
    isSettingsExpanded: false
  };

  toggleSettings = () => {
    this.setState({ isSettingsExpanded: !this.state.isSettingsExpanded });
  };

  render() {
    const { repoDetails, session } = this.props.data;
    const { hasMenuApp } = this.props.storage;
    const { isSettingsExpanded } = this.state;
    return (
      <div>
        <div className="header-upper">
          <TitleBar repoDetails={repoDetails} hasMenuApp={hasMenuApp} />
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
