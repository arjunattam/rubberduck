import React from "react";
import Octicon from "react-component-octicons";
import "./Title.css";

const Title = ({ repoDetails }) => {
  const { username, reponame } = repoDetails;
  const href = `/${username}/${reponame}`;
  const icon = "repo";
  return (
    <div className="reponame">
      <Octicon name={icon} style={{ height: 18 }} />{" "}
      <a href={href}>
        <strong>{reponame}</strong>
      </a>
    </div>
  );
};

export const TitleBar = props => {
  return (
    <div className="title-bar-container">
      <Title {...props} />
    </div>
  );
};
