import React from "react";
import { connect } from "react-redux";
import Octicon from "react-component-octicons";
import "./Title.css";

const getPRTitle = () => {
  const element = document.querySelector(
    "#partial-discussion-header > div.gh-header-show > h1"
  );
  if (element) {
    return element.textContent;
  } else {
    return "";
  }
};

class Title extends React.Component {
  renderBranch = repoDetails => (
    <div className="branch">
      <Octicon name="git-branch" style={{ height: 12 }} /> {repoDetails.branch}
    </div>
  );

  renderPR = repoDetails => (
    <div className="branch">
      <Octicon name="git-pull-request" style={{ height: 12 }} /> {getPRTitle()}
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
