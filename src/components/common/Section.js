import React from "react";
import "./Section.css";

export default class SectionHeader extends React.Component {
  render() {
    return (
      <div className="section-header" onClick={this.props.onClick}>
        {this.props.isVisible ? "▼ " : "▷ "} {this.props.name}
      </div>
    );
  }
}
