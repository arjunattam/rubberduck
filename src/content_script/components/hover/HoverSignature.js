import React from "react";
import SyntaxHighlight from "../common/SyntaxHighlight";

const HoverSignature = props => (
  <SyntaxHighlight language={props.language} children={props.signature} />
);

export default HoverSignature;
