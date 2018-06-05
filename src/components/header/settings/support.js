import React from "react";
import RubberduckIcon from "../../icon";

const VERSION = "0.2.21";
const github =
  "https://github.com/karigari/rubberduck-issues/issues/new/choose";
const twitter = "https://twitter.com/getrubberduck";
const changelog = "https://www.rubberduck.io/blog";
const email = "team@rubberduck.io";
const mailto = `mailto:${email}`;

export const IconSection = props => (
  <div className="settings-sub-section">
    <div className="row">
      <div>
        <h5>Rubberduck</h5>
        v{VERSION} ·{" "}
        <a href={changelog} target="_blank">
          Changelog
        </a>
      </div>
      <div>
        <RubberduckIcon size="24" />
      </div>
    </div>
    <div />
  </div>
);

const openLink = event => {
  event.preventDefault();
  window.open(github, "_blank");
};

export const SupportSection = props => (
  <div className="settings-sub-section">
    <h5>Support</h5>
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
