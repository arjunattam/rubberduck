import React from "react";
import ExpandedCode from "../common/ExpandedCode";
import CodeNode from "../common/CodeNode";
import Docstring from "../common/Docstring";

export default class DefinitionItem extends React.Component {
  state = {
    isHovering: false
  };

  handleMouseHover = () => {
    this.setState({
      isHovering: !this.state.isHovering
    });
  };

  getTop = () => {
    return this.refs.container.getBoundingClientRect().top;
  };

  renderDocstring = () => {
    return this.props.docstring ? (
      <div className="definition-docstring">
        <Docstring docstring={this.props.docstring} />
      </div>
    ) : null;
  };

  render() {
    return (
      <div
        className="definition-item"
        onMouseEnter={this.handleMouseHover}
        onMouseLeave={this.handleMouseHover}
        ref={"container"}
      >
        <CodeNode {...this.props} children={this.renderDocstring()} />

        {this.state.isHovering ? (
          <ExpandedCode {...this.props} top={this.getTop()} />
        ) : null}
      </div>
    );
  }
}
