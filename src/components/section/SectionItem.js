import React from "react";
import SmallCodeSnippet from "../common/SmallCodeSnippet";

const BaseSectionItem = props => (
  <div className="reference-item" onMouseEnter={() => props.onHover()}>
    <SmallCodeSnippet
      contents={props.codeSnippet}
      contentLine={props.lineNumber - props.startLineNumber}
      lineNumber={props.lineNumber}
    />
  </div>
);

export default BaseSectionItem;
