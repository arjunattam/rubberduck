import React from "react";
import ReactMarkdown from "react-markdown";
import { decodeBase64 } from "../../utils/data";

const Docstring = docstringData => {
  const decodedData = decodeBase64(docstringData || "");
  // const jsx = decodedData.split("\n").map((line, index) => {
  //   return (
  //     <span key={index}>
  //       {line}
  //       <br />
  //     </span>
  //   );
  // });
  return <ReactMarkdown source={decodedData} />;
};

export default Docstring;
