import React from "react";
import "./Tree.css";

class ReferenceItem extends React.Component {
  render() {
    return <div className="reference-item">empty</div>;
  }
}

export default class References extends React.Component {
  state = {
    isVisible: false
  };

  toggleVisibility = () => {
    this.setState({
      isVisible: !this.state.isVisible
    });
  };

  render() {
    if (this.state.isVisible) {
      return (
        <div className="references-section">
          <div className="tree-header" onClick={this.toggleVisibility}>
            ▼ References
          </div>
          <ReferenceItem />
        </div>
      );
    } else {
      return (
        <div className="references-section">
          <div className="tree-header" onClick={this.toggleVisibility}>
            ▷ References
          </div>
        </div>
      );
    }
  }
}
