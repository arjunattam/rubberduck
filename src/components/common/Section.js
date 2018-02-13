import React from "react";
import Octicon from "react-component-octicons";
import "./Section.css";

const SectionHeaderIcon = props => {
  const iconStyle = { height: 12, marginRight: "5px" };

  if (props.isOpen) {
    return <Octicon name="triangle-down" style={iconStyle} />;
  } else {
    return <Octicon name="triangle-right" style={iconStyle} />;
  }
};

export default class SectionHeader extends React.Component {
  render() {
    return (
      <div className="section-header" onClick={this.props.onClick}>
        <SectionHeaderIcon isOpen={this.props.isVisible} />
        {this.props.name}
      </div>
    );
  }
}
