import React from "react";

export default class CollapseButton extends React.Component {
  render() {
    return (
      <div>
        <a href="#" onClick={this.props.onClick}>
          {this.props.text}
        </a>
      </div>
    );
  }
}
