import React from "react";
import RubberduckIcon from "../../icon";

const VERSION = "0.2.21";
const changelog = "https://www.rubberduck.io/blog";
const support = "https://www.rubberduck.io/support";

const VersionSection = () => (
  <div className="settings-sub-section">
    <div className="row">
      <div>
        <p>version {VERSION}</p>
        <div>
          <a href={changelog} target="_blank">
            Changelog
          </a>{" "}
          ·{" "}
          <a href={support} target="_blank">
            Support
          </a>
        </div>
      </div>
      <div>
        <RubberduckIcon size="24" />
      </div>
    </div>
  </div>
);

export default VersionSection;
