import * as React from "react";

export const GitInfoSection = ({ data }: { data?: IGitInfo }) => {
  return (
    <div>
      <h2>Git info section</h2>
      <div>Location: {data ? data.location : ""}</div>
    </div>
  );
};
