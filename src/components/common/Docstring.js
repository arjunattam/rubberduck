import React from "react";
import ReactMarkdown from "react-markdown";
import { decodeBase64 } from "../../utils/data";

const Docstring = docstringData => {
  const decodedData = decodeBase64(docstringData || "");
  return <ReactMarkdown source={decodedData} />;
};

export default Docstring;
