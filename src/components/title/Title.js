import React from "react";
import { connect } from "react-redux";
import Octicon from "react-component-octicons";
import { getGitService } from "../../adapters";
import "./Title.css";

const iconStyle = { height: 12, color: "#999" };

const getPRTitle = () => {
  let selector = null;

  switch (getGitService()) {
    case "github":
      selector = "#partial-discussion-header > div.gh-header-show > h1";
      break;
    case "bitbucket":
      selector =
        "#content > header > div.app-header--primary > div > h1 > span";
      break;
    default:
      selector = "";
  }

  const element = document.querySelector(selector);
  return element ? element.textContent : "";
};

const getCommitTitle = () => {
  const commitSelector =
    "div.repository-content > div.commit.full-commit.px-2.pt-2 > p";
  const element = document.querySelector(commitSelector);
  return element ? element.textContent : "";
};

const getCompareTitle = () => {
  const selector =
    "#js-repo-pjax-container > div.container.new-discussion-timeline.experiment-repo-nav > div.repository-content > div.gh-header.gh-header-new-pr > div.range-editor.text-gray.js-range-editor > div:nth-child(4) > div.select-menu.js-menu-container.js-select-menu.commitish-suggester > button > span";
  const element = document.querySelector(selector);
  return element ? element.getAttribute("title") : "";
};

class Title extends React.Component {
  renderSubtitle = repoDetails => {
    let inner = null;
    let iconName = "git-branch";

    switch (repoDetails.type) {
      case "pull":
        iconName = "git-pull-request";
        inner = getPRTitle();
        break;
      case "commit":
        iconName = "diff";
        inner = getCommitTitle();
        break;
      case "compare":
        iconName = "git-compare";
        inner = getCompareTitle();
        break;
      default:
        inner = repoDetails.branch;
    }

    return (
      <div className="branch">
        <Octicon name={iconName} style={iconStyle} /> {inner}
      </div>
    );
  };

  renderTitle = repoDetails => {
    const reponameHref =
      "/" + repoDetails.username + "/" + repoDetails.reponame;

    return (
      <div className="reponame">
        <Octicon name="repo" style={{ height: 21 }} />{" "}
        <a href={reponameHref}>
          <strong>{repoDetails.reponame}</strong>
        </a>
      </div>
    );
  };

  render() {
    const repoDetails = this.props.data.repoDetails;
    return (
      <div className="header">
        {this.renderTitle(repoDetails)}
        {this.renderSubtitle(repoDetails)}
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
