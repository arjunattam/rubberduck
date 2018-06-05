import React from "react";
import { connect } from "react-redux";
import Title from "./title";
import { Settings } from "./settings";
import SessionStatus from "./session";

class Header extends React.Component {
  state = {
    isSettingsExpanded: false
  };

  toggleSettings = () => {
    this.setState({ isSettingsExpanded: !this.state.isSettingsExpanded });
  };

  render() {
    return (
      <div>
        <Title
          settingsOnClick={this.toggleSettings}
          repoDetails={this.props.data.repoDetails}
        />
        <SessionStatus />
        {this.state.isSettingsExpanded ? <Settings {...this.props} /> : null}
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
