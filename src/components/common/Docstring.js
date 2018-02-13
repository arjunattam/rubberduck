import React from "react";

export default function Docstring(docstringData) {
  const jsx = docstringData.split("\n").map((line, index) => {
    return (
      <span key={index}>
        {line}
        <br />
      </span>
    );
  });
  return jsx;
}
