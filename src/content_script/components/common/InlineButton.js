import React from "react";
import Octicon from "react-component-octicons";
import "./CodeNode.css";

const InlineIcon = props => (
  <Octicon name={props.name} style={{ height: 12, width: 12, marginLeft: 3 }} />
);

const InlineButton = props => (
  <a
    className="code-node-button"
    href={props.href}
    style={props.style}
    onClick={props.onClick}
    target={props.isBlank ? "_blank" : null}
  >
    {props.text}
    {props.icon ? <InlineIcon name={props.icon} /> : null}
  </a>
);

export default InlineButton;
