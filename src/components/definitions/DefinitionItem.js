import ExpandedCode from "../common/ExpandedCode";
import CodeNode from "../common/CodeNode";
import Docstring from "../common/Docstring";

import React from "react";

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

  render() {
    return (
      <div
        className="definition-item"
        onMouseEnter={this.handleMouseHover}
        onMouseLeave={this.handleMouseHover}
        ref={"container"}
      >
        <CodeNode {...this.props}>
          <div className="definition-docstring">
            {this.props.docstring ? (
              <Docstring docstring={this.props.docstring} />
            ) : (
              "No docstring found"
            )}
          </div>
        </CodeNode>

        {this.state.isHovering ? (
          <ExpandedCode {...this.props} top={this.getTop()} />
        ) : null}
      </div>
    );
  }
}
