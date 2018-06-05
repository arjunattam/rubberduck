import React from "react";
import { connect } from "react-redux";
import Title from "./title";
import { Settings } from "./settings";
import SessionStatus from "./session";

class Header extends React.Component {
  state = {
    isSettingsExpanded: true
  };

  toggleSettings = () => {
    this.setState({ isSettingsExpanded: !this.state.isSettingsExpanded });
  };

  renderSettings = () => (
    <Settings isVisible={this.state.isSettingsExpanded} {...this.props} />
  );

  render() {
    return (
      <div>
        <Title
          settingsOnClick={this.toggleSettings}
          repoDetails={this.props.data.repoDetails}
        />
        {this.renderSettings()}
        <SessionStatus {...this.props} />
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
