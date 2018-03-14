import React from "react";
import { decodeBase64 } from "../../utils/data";

export default function Docstring(docstringData) {
  const decodedData = decodeBase64(docstringData || "");
  const jsx = decodedData.split("\n").map((line, index) => {
    return (
      <span key={index}>
        {line}
        <br />
      </span>
    );
  });
  return jsx;
}
