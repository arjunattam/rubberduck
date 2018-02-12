import React from "react";
import SectionHeader from "./common/Section";
import "./References.css";

class ReferenceItem extends React.Component {
  render() {
    return <div className="reference-item monospace">empty</div>;
  }
}

export default class References extends React.Component {
  state = {
    isVisible: true
  };

  toggleVisibility = () => {
    this.setState({
      isVisible: !this.state.isVisible
    });
  };

  render() {
    return (
      <div className="references-section">
        <SectionHeader
          onClick={this.toggleVisibility}
          isVisible={this.state.isVisible}
          name={"References"}
        />
        {this.state.isVisible ? <ReferenceItem /> : null}
      </div>
    );
  }
}
