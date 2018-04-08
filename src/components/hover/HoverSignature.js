import React from "react";
import SyntaxHighlighter from "react-syntax-highlighter";
import { githubGist as githubStyle } from "react-syntax-highlighter/styles/hljs";

const HoverSignature = props => (
  <SyntaxHighlighter
    language={props.language}
    children={props.signature}
    style={githubStyle}
    wrapLines={true}
  />
);

export default HoverSignature;
