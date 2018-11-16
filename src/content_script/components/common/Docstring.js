import React from "react";
import ReactMarkdown from "react-markdown";
import { decodeBase64 } from "../../utils/data";

const Docstring = props => {
  const { docstring } = props;
  const decodedData = decodeBase64(docstring || "");
  return <ReactMarkdown source={decodedData} />;
};

export default Docstring;
