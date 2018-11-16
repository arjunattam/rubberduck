import { getGitService } from "../../../adapters";

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

export const getBranchInfo = repoDetails => {
  let text = null;
  let iconName = "git-branch";

  switch (repoDetails.type) {
    case "pull":
      iconName = "git-pull-request";
      text = getPRTitle();
      break;
    case "commit":
      iconName = "diff";
      text = getCommitTitle();
      break;
    case "compare":
      iconName = "git-compare";
      text = getCompareTitle();
      break;
    default:
      text = repoDetails.branch;
  }

  return { text, iconName };
};
