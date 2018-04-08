import React from "react";
import PropTypes from "prop-types";
import Docstring from "../common/Docstring";
import HoverSignature from "./HoverSignature";
import "./Hover.css";

const MAX_HEIGHT = 240;
const MAX_WIDTH = 300;
const TOP_MARGIN = 4;

const ExpandHelper = props => (
  <div className="expand-helper">
    {props.isExpandable ? (
      <div>
        {"⌘ "}
        <strong>{"expand"}</strong>
      </div>
    ) : null}
    <div>
      {"⌘ + click "}
      <strong>{`${props.action}`}</strong>
    </div>
  </div>
);

export default class HoverBox extends React.Component {
  // Presentation component for the hover box
  state = {
    isExpanded: false
  };

  static propTypes = {
    name: PropTypes.string,
    docstring: PropTypes.string,
    lineNumber: PropTypes.number,
    charNumber: PropTypes.number,
    filePath: PropTypes.string,
    fileSha: PropTypes.string,
    x: PropTypes.number,
    y: PropTypes.number,
    element: PropTypes.object,
    onReferences: PropTypes.func,
    onDefinition: PropTypes.func
  };

  isVisibleToUser = () => this.props.x > 0;

  getPosition = () => {
    // This decides where the hover box should be placed, looking at the
    // bounding rectangle of the element and the window.
    let left = this.props.x;
    let top = this.props.y;
    const { element } = this.props;

    if (element && element.getBoundingClientRect) {
      const boundRect = element.getBoundingClientRect();
      left = boundRect.left || left;
      top = boundRect.top || top;

      if (left + MAX_WIDTH > window.innerWidth) {
        left = window.innerWidth - MAX_WIDTH - 20;
      }

      if (top < MAX_HEIGHT) {
        // The box should be at the bottom of the element
        top = boundRect.bottom + TOP_MARGIN;
        return { left, top };
      }
    }

    return {
      left,
      bottom: window.innerHeight - top + TOP_MARGIN
    };
  };

  getDisplay = () => {
    // Adding display styling for the opacity animation to trigger
    if (this.isVisibleToUser()) {
      return { display: "block" };
    } else {
      return { display: "none" };
    }
  };

  getStyle = () => {
    return { ...this.getPosition(), ...this.getDisplay() };
  };

  getLine = location => location.range.start.line;

  isDefinition = () =>
    this.props.definition &&
    this.getLine(this.props.definition.location) ===
      this.getLine(this.props.location);

  isExpandKeyCode = keyCode => {
    // Handles command key left/right on Mac
    return keyCode === 91 || keyCode === 93;
  };

  onKeyDown = event => {
    if (this.isExpandKeyCode(event.keyCode)) {
      this.setState({
        isExpanded: true
      });
    }
  };

  onKeyUp = event => {
    if (this.isExpandKeyCode(event.keyCode)) {
      this.setState({
        isExpanded: false
      });
    }
  };

  doDefaultAction = () => {
    if (this.isDefinition()) {
      this.props.onReferences();
    } else {
      this.props.onDefinition();
    }
  };

  onClick = event => {
    if (this.state.isExpanded && this.isVisibleToUser()) {
      this.doDefaultAction();
    }
  };

  componentDidMount() {
    document.addEventListener("keydown", this.onKeyDown);
    document.addEventListener("keyup", this.onKeyUp);
    document.addEventListener("click", this.onClick);
  }

  componentWillReceiveProps(newProps) {
    if (newProps.x !== this.props.x && newProps.x > 0) {
      // Reset the expanded state whenever we get new props
      this.setState({
        isExpanded: false
      });
    }
  }

  renderBasic() {
    const { name, signature, language } = this.props;
    console.log(this.props);
    return (
      <div className="basic monospace">
        <HoverSignature
          language={language || ""}
          signature={signature || name || ""}
        />
      </div>
    );
  }

  renderExpanded() {
    return (
      <div>
        <div className="expanded">{Docstring(this.props.docstring)}</div>
        {this.renderBasic()}
      </div>
    );
  }

  render() {
    const action = this.isDefinition() ? "usages" : "definition";

    return (
      <div className="hover-box" style={this.getStyle()}>
        <ExpandHelper isExpandable={true} action={action} />
        {this.state.isExpanded ? this.renderExpanded() : this.renderBasic()}
      </div>
    );
  }
}
