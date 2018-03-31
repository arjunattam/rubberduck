import React from "react";
import { connect } from "react-redux";
import Octicon from "react-component-octicons";
import { getGitService } from "../../adapters";
import "./Title.css";

const getPRTitleSelector = () => {
  const service = getGitService();

  if (service === "github") {
    return "#partial-discussion-header > div.gh-header-show > h1";
  } else if (service === "bitbucket") {
    return "#content > header > div.app-header--primary > div > h1 > span";
  }
};

const getPRTitle = () => {
  const element = document.querySelector(getPRTitleSelector());

  if (element) {
    return element.textContent;
  } else {
    return "";
  }
};

const iconStyle = { height: 12, color: "#999" };

class Title extends React.Component {
  renderBranch = repoDetails => (
    <div className="branch">
      <Octicon name="git-branch" style={iconStyle} /> {repoDetails.branch}
    </div>
  );

  renderPR = repoDetails => (
    <div className="branch">
      <Octicon name="git-pull-request" style={iconStyle} /> {getPRTitle()}
    </div>
  );

  renderSubtitle = repoDetails =>
    repoDetails.prId
      ? this.renderPR(repoDetails)
      : this.renderBranch(repoDetails);

  render() {
    const repoDetails = this.props.data.repoDetails;
    const reponameHref =
      "/" + repoDetails.username + "/" + repoDetails.reponame;

    return (
      <div className="header">
        <p>
          <Octicon name="repo" style={{ height: 21 }} />{" "}
          <a href={reponameHref}>
            <strong>{repoDetails.reponame}</strong>
          </a>
        </p>
        {this.renderSubtitle(repoDetails)}
        <div>{this.props.children}</div>
      </div>
    );
  }
}

function mapStateToProps(state) {
  const { storage, data } = state;
  return {
    storage,
    data
  };
}
export default connect(mapStateToProps)(Title);
