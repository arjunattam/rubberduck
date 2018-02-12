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
const GH_PJAX_CONTAINER_SEL =
  "#js-repo-pjax-container, .context-loader-container, [data-pjax-container]";
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
  // (username)/(reponame)[/(type)][/(typeId)][/(filePath)]
  const match = window.location.pathname.match(
    // /([^\/]+)\/([^\/]+)(?:\/([^\/]+))?(?:\/([^\/]+))?(?:\/(.+))?/
    /([^\/]+)\/([^\/]+)(?:\/([^\/]+))?(?:\/([^\/]+))?/
  );

  if (checkIfSkipped()) {
    return {};
  }

  const username = match[1];
  const reponame = match[2];
  const type = match[3];
  const typeId = match[4];
  const path = match[5];

  if (
    ~GH_RESERVED_USER_NAMES.indexOf(username) ||
    ~GH_RESERVED_REPO_NAMES.indexOf(reponame)
  ) {
    // Not a repository, skip
    return {};
  }

  // Check if this is a PR and whether we should show changes
  const isPR = type === "pull";
  const pullNumber = isPR ? typeId : null;

  return {
    username: username,
    reponame: reponame,
    type: type,
    typeId: typeId,
    branch: getBranch(),
    path: path
  };
};

export const constructPath = (subPath, orgname, reponame, typeId) => {
  // return relative path which follows a domain name, like
  // github.com, from given sub-path
  if (typeId === undefined) {
    typeId = "master";
  }

  return "/" + orgname + "/" + reponame + "/blob/" + typeId + "/" + subPath;
};
