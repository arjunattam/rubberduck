import React from "react";
import Octicon from "react-component-octicons";
import "./Title.css";

const EnvironmentIcon = ({ hasMenuApp }) => {
  const icon = hasMenuApp ? "shield" : "server";
  return <Octicon name={icon} />;
};

const Title = ({ repoDetails }) => {
  const { username, reponame } = repoDetails;
  const href = `/${username}/${reponame}`;
  return (
    <div className="reponame">
      <Octicon name="repo" style={{ height: 21 }} />{" "}
      <a href={href}>
        <strong>{reponame}</strong>
      </a>
    </div>
  );
};

const TitleBar = ({ repoDetails, hasMenuApp }) => {
  return (
    <div class="title-bar-container">
      <Title repoDetails={repoDetails} />
      <EnvironmentIcon hasMenuApp={hasMenuApp} />
    </div>
  );
};

export default TitleBar;
