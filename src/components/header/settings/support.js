import React from "react";
import RubberduckIcon from "../../icon";

const VERSION = "0.2.21";
const github =
  "https://github.com/karigari/rubberduck-issues/issues/new/choose";
const twitter = "https://twitter.com/getrubberduck";
const changelog = "https://www.rubberduck.io/blog";
const email = "team@rubberduck.io";
const mailto = `mailto:${email}`;

const IconSection = () => (
  <div className="row">
    <div>
      <h5>Rubberduck</h5>
    </div>
    <div>
      <RubberduckIcon size="24" />
    </div>
  </div>
);

const openLink = event => {
  event.preventDefault();
  window.open(github, "_blank");
};

const SupportSection = () => (
  <div className="settings-sub-section">
    <IconSection />
    <div>
      v{VERSION} ·{" "}
      <a href={changelog} target="_blank">
        Changelog
      </a>
    </div>
    <div>
      <a href={github} onClick={openLink}>
        Report issue
      </a>{" "}
      ·{" "}
      <a href={twitter} target="_blank">
        Twitter
      </a>{" "}
      · <a href={mailto}>Email</a>
    </div>
  </div>
);

export default SupportSection;
