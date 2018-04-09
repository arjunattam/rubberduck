import React from "react";
import SyntaxHighlight from "../common/SyntaxHighlight";

// TODO(arjun): the wrapLines flag causes `frontmatter.go` in Hugo
// to show weird things for the structs
const HoverSignature = props => (
  <SyntaxHighlight language={props.language} children={props.signature} />
);

export default HoverSignature;
