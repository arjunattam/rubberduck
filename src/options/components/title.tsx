import * as React from "react";

export const Title = () => {
  return (
    <div className="d-flex align-items-baseline">
      <h1>
        <span>Rubberduck</span>{" "}
        <span className="text-muted font-weight-normal">configuration</span>
      </h1>
      <div>
        <a
          href="https://github.com/karigari/rubberduck"
          target="_blank"
          className="ml-3"
        >
          GitHub
        </a>
        <a href="https://rubberduck.io" target="_blank" className="ml-3">
          Website
        </a>
      </div>
    </div>
  );
};
