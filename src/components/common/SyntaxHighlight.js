import React from "react";
import SyntaxHighlighter from "react-syntax-highlighter";
import { githubGist as githubStyle } from "react-syntax-highlighter/styles/hljs";

const SyntaxHighlight = props => (
  <SyntaxHighlighter
    {...props}
    style={githubStyle}
    wrapLines={true}
    children={props.children}
    lineNumberStyle={{ color: "rgba(27, 31, 35, 0.3)" }} // Same as github
  />
);

export default SyntaxHighlight;
