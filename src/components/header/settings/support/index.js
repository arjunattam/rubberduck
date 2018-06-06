import React from "react";

const github =
  "https://github.com/karigari/rubberduck-issues/issues/new/choose";

const openLink = event => {
  event.preventDefault();
  window.open(github, "_blank");
};

const SupportSection = ({ supportLink }) => {
  if (supportLink) {
    const { link, text } = supportLink;
    return (
      <div className="settings-sub-section support-section">
        <p>{text}</p>
        <p>
          <a href={link} target="_blank">
            Read more ↗
          </a>
        </p>
        <div>
          <a onClick={openLink} href="#">
            Report issue
          </a>
        </div>
      </div>
    );
  } else {
    return null;
  }
};

export default SupportSection;
