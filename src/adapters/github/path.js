// This is a set of utils for Github path (window url) manipulation
// https://github.com/buunguyen/octotree/blob/master/src/adapters/github.js#L76

// prettier-ignore
const GH_RESERVED_USER_NAMES = [ // These cannot be usernames
    'settings', 'orgs', 'organizations',
    'site', 'blog', 'about', 'explore',
    'styleguide', 'showcases', 'trending',
    'stars', 'dashboard', 'notifications',
    'search', 'developer', 'account',
    'pulls', 'issues', 'features', 'contact',
    'security', 'join', 'login', 'watching',
    'new', 'integrations', 'gist', 'business',
    'mirrors', 'open-source', 'personal',
    'pricing'
  ]
const GH_RESERVED_REPO_NAMES = ["followers", "following", "repositories"];
const GH_404_SEL = "#parallax_wrapper";

const GH_RAW_CONTENT = "body > pre";

const checkIfSkipped = () => {
  // This method applies some conditions to see if the page should be skipped
  // Reference: https://github.com/buunguyen/octotree/blob/master/src/adapters/github.js
  if (document.querySelector(GH_404_SEL) != null) {
    // Element exists, this is a 404
    return true;
  }

  if (document.querySelector(GH_RAW_CONTENT) != null) {
    // This is a raw page
    return true;
  }

  return false;
};

const getBranch = () => {
  // Get branch by inspecting page, quite fragile so provide multiple fallbacks
  // From https://github.com/buunguyen/octotree/blob/master/src/adapters/github.js#L116
  // There are some more handled cases in Octotree
  const codePageSelector = document.querySelector(
    ".branch-select-menu .select-menu-item.selected"
  );
  let codePageBranch = null;

  if (codePageSelector !== null) {
    codePageBranch = codePageSelector.getAttribute("data-name");
  }

  const prPageSelector = document.querySelector(".commit-ref.base-ref");
  let prPageBranch = null;

  if (prPageSelector !== null) {
    prPageBranch = prPageSelector.getAttribute("title");
  }

  return codePageBranch || prPageBranch;
};

export const getRepoFromPath = () => {
  let repoDetails = {
    username: null,
    reponame: null,
    type: null,
    typeId: null,
    branch: null,
    path: null
  };

  // (username)/(reponame)[/(type)][/(typeId)][/(filePath)]
  const match = window.location.pathname.match(
    // /([^\/]+)\/([^\/]+)(?:\/([^\/]+))?(?:\/([^\/]+))?(?:\/(.+))?/
    /([^\/]+)\/([^\/]+)(?:\/([^\/]+))?(?:\/([^\/]+))?/
  );

  if (window.location.hostname !== "github.com" || checkIfSkipped() || !match) {
    return repoDetails;
  }

  const username = match[1] || null;
  const reponame = match[2] || null;
  const type = match[3] || null;
  const typeId = match[4] || null;
  const path = match[5] || null;

  if (
    ~GH_RESERVED_USER_NAMES.indexOf(username) ||
    ~GH_RESERVED_REPO_NAMES.indexOf(reponame)
  ) {
    // Not a repository, skip
    return repoDetails;
  }
  const branch = getBranch() || null;

  return {
    username: username,
    reponame: reponame,
    type: type,
    typeId: typeId,
    branch: branch,
    path: path
  };
};

export const constructPath = (subPath, orgname, reponame, branch) => {
  // return relative path which follows a domain name, like
  // github.com, from given sub-path
  if (branch === undefined) {
    branch = "master";
  }

  return "/" + orgname + "/" + reponame + "/blob/" + branch + "/" + subPath;
};

export const isSameSessionPath = (oldRepoDetails, newRepoDetails) => {
  if (!oldRepoDetails || !newRepoDetails) {
    return false;
  }
  let isSame = true;
  for (let key in oldRepoDetails) {
    if (oldRepoDetails[key] !== newRepoDetails[key]) {
      isSame = false;
      break;
    }
  }
  return isSame;
};
