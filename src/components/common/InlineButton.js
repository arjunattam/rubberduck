import React from "react";
import Octicon from "react-component-octicons";
import "./CodeNode.css";

const InlineIcon = props => (
  <Octicon name={props.name} style={{ marginLeft: 3 }} />
);

const InlineButton = props => (
  <div className="code-node-button" style={props.style}>
    <a
      href={props.href}
      onClick={props.onClick}
      target={props.isBlank ? "_blank" : null}
    >
      {props.text}
      {props.icon ? <InlineIcon name={props.icon} /> : null}
    </a>
  </div>
);

export default InlineButton;
