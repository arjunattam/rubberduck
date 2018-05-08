import React from "react";
import "./CodeNode.css";

const InlineButton = props => (
  <div className="code-node-button">
    <a
      href={props.href}
      onClick={props.onClick}
      target={props.isBlank ? "_blank" : null}
    >
      {props.text}
    </a>
  </div>
);

export default InlineButton;
