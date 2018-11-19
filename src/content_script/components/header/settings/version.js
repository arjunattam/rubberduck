import React from "react";
import RubberduckIcon from "../../icon";
import { VERSION } from "../../../utils/version";

const changelog = "https://www.rubberduck.io/blog";

const VersionSection = () => (
  <div className="settings-sub-section">
    <div className="row">
      <div>
        <p>version {VERSION}</p>
        <div>
          <a href={changelog} target="_blank">
            Changelog
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
