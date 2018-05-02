// This is a set of utils for Github path (window url) manipulation
// https://github.com/buunguyen/octotree/blob/master/src/adapters/github.js#L76
import { API } from "../../utils/api";

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
    'pricing', 'marketplace', 'apps', 'topics'
  ]
const GH_RESERVED_REPO_NAMES = ["followers", "following", "repositories"];
const GH_RESERVED_SUB_PAGES = [
  "issues",
  "pulls",
  "graphs",
  "settings",
  "pulse",
  "wiki",
  "projects"
];
const GH_404_SEL = "#parallax_wrapper";
const GH_AUTH_FORM_SEL = ".auth-form-body";
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

  if (document.querySelector(GH_AUTH_FORM_SEL) != null) {
    // This is a login page
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

  const branchMenuDiv = document.querySelector(".branch-select-menu");
  let menuBranch = null;
  if (branchMenuDiv !== null) {
    const innerSpan = branchMenuDiv.querySelector("span.js-select-button");
    menuBranch = innerSpan.textContent;
  }

  return codePageBranch || prPageBranch || menuBranch;
};

const getCommitViewSha = () => {
  const headShaBlock = document.querySelector("span.sha-block span.sha");
  const baseShaBlock = document.querySelector("span.sha-block a.sha");
  const baseInner = baseShaBlock.parentElement.innerHTML;

  return {
    head: headShaBlock.textContent.trim(),
    base: baseInner.match(/\b[0-9a-f]{40}\b/)[0]
  };
};

const getCompareViewSha = username => {
  const repoLabelElements = Array.from(
    document.querySelectorAll("div.range-cross-repo-pair")
  );
  let result = {};
  repoLabelElements.map(element => {
    // each repo label has a branch name and repo name (in case of fork comparison)
    const branchElement = element.querySelector(
      "div.commitish-suggester span.js-select-button"
    );
    const repoElement = element.querySelector(
      "div.fork-suggester span.js-select-button"
    );
    const branchText = branchElement.getAttribute("title");
    const match = branchText.match(/(base|compare): (.+)/);
    let prefix = "";

    if (repoElement) {
      const repoName = repoElement.textContent;
      const repoNameMatch = repoName.match(/(.+)\/(.+)/);

      if (repoNameMatch.length > 0 && repoNameMatch[1] !== username)
        prefix = `${repoNameMatch[1]}:`;
    }
    result[match[1] === "compare" ? "head" : match[1]] = `${prefix}${match[2]}`;
  });
  return result;
};

async function findPRBase(repoDetails) {
  // TODO(arjun): This is broken in the case of private repositories,
  // because the JWT is not loaded before this API call is made.
  // To repro, open https://github.com/karigari/mercury/pull/31/commits/0d9ca4212262f4406a4373a04bb1d7a0bcb139e5
  const response = await API.getPRInfo(repoDetails);
  return response ? response.base.sha : null;
}

const getPRCommitSha = repoDetails => {
  // In cases where the PR diff view specifies some commits
  const match = window.location.pathname.match(
    /pull\/\d+\/(commits|files)\/([.0-9a-z]+)/
  );

  if (match === null) {
    return null;
  } else if (match.length >= 2) {
    const shaPlaceholder = match[2];
    const shaPairMatch = shaPlaceholder.match(/([0-9a-z]+)\.\.([0-9a-z]+)/);

    if (shaPairMatch === null) {
      // We have the head, and need to call API to get base
      let result = { base: null, head: shaPlaceholder };

      return findPRBase(repoDetails).then(value => {
        result.base = value;
        return result;
      });
    } else {
      const result = { base: shaPairMatch[1], head: shaPairMatch[2] };

      return new Promise((resolve, reject) => {
        resolve(result);
      });
    }
  }

  return null;
};

const getFilePath = () => {
  const pathElement = document.getElementById("blob-path");

  if (pathElement !== null) {
    const fullPath = pathElement.textContent.trim();
    const firstSlashIndex = fullPath.indexOf("/");
    return fullPath.slice(firstSlashIndex + 1);
  }

  return null;
};

const getIsPrivate = () => {
  const labelElement = document.querySelector("span.Label.Label--outline");

  if (labelElement) {
    return labelElement.textContent === "Private";
  }

  return false;
};

const getRepoFromPath = () => {
  // Parse url path to infer repo data
  let repoDetails = {
    username: null,
    reponame: null,
    type: null,
    typeId: null
  };

  // (username)/(reponame)[/(type)][/(typeId)][/(filePath)]
  const match = window.location.pathname.match(
    /([^\/]+)\/([^\/]+)(?:\/([^\/]+))?(?:\/([^\/]+))?/
  );

  if (window.location.hostname !== "github.com" || checkIfSkipped() || !match) {
    return repoDetails;
  }

  const username = match[1] || null;
  const reponame = match[2] || null;
  const type = match[3] || null;
  const typeId = match[4] || null;

  if (
    ~GH_RESERVED_USER_NAMES.indexOf(username) ||
    ~GH_RESERVED_REPO_NAMES.indexOf(reponame)
  ) {
    // Not a repository, skip
    return repoDetails;
  }

  // if (~GH_RESERVED_SUB_PAGES.indexOf(type)) {
  //   // These aren't code pages
  //   return repoDetails;
  // }

  // Check if this is a Tree/Blob view
  const isFileView = type === null || type === "tree" || type === "blob";

  return {
    username: username,
    reponame: reponame,
    type: isFileView ? "file" : type,
    typeId: typeId
  };
};

export default class GithubPathAdapter {
  // TODO(arjun): should this not extend the base path adapter?
  static constructPath = (subPath, orgname, reponame, branch) => {
    // return relative path which follows a domain name, like
    // github.com, from given sub-path
    if (branch === undefined || branch === null) {
      // TODO(arjun): for some projects, master is not the default branch
      // hence this breaks
      branch = "master";
    }

    return "/" + orgname + "/" + reponame + "/blob/" + branch + "/" + subPath;
  };

  static isSameSessionPath = (oldRepoDetails, newRepoDetails) => {
    if (!oldRepoDetails || !newRepoDetails) {
      return false;
    }

    const isTypeSame = oldRepoDetails.type === newRepoDetails.type;
    const isHeadSame = oldRepoDetails.headSha === newRepoDetails.headSha;
    const isBaseSame = oldRepoDetails.baseSha === newRepoDetails.baseSha;
    const isBranchSame = oldRepoDetails.branch === newRepoDetails.branch;
    return isTypeSame && isHeadSame && isBaseSame && isBranchSame;
  };

  static hasChangedPath = (oldRepoDetails, newRepoDetails) => {
    if (!oldRepoDetails || !newRepoDetails) {
      return false;
    }

    return oldRepoDetails.path !== newRepoDetails.path;
  };

  static fetchRepoDetails = () => {
    // Build the repo details object, with path parsing or API calls.
    // Return promise that will be saved in Redux store.
    let repoDetails = {
      username: null,
      reponame: null,
      isPrivate: null,
      type: null,
      prId: null,
      branch: null,
      headSha: null,
      baseSha: null,
      path: null
    };

    const repoFromPath = getRepoFromPath();
    repoDetails.username = repoFromPath.username;
    repoDetails.reponame = repoFromPath.reponame;
    repoDetails.type = repoFromPath.type;
    repoDetails.prId =
      repoFromPath.type === "pull" ? repoFromPath.typeId : null;

    repoDetails.branch = getBranch() || null;
    repoDetails.isPrivate = getIsPrivate();
    repoDetails.path = getFilePath();

    // Fill up base/head for types
    if (repoDetails.type === "commit") {
      const { base, head } = getCommitViewSha();
      repoDetails.headSha = head;
      repoDetails.baseSha = base;
    } else if (repoDetails.type === "compare") {
      const { base, head } = getCompareViewSha(repoDetails.username);
      repoDetails.headSha = head;
      repoDetails.baseSha = base;
    } else if (repoDetails.type === "pull") {
      const shaPromise = getPRCommitSha(repoDetails);

      if (shaPromise !== null) {
        return shaPromise.then(shas => {
          repoDetails.headSha = shas.head;
          repoDetails.baseSha = shas.base;
          repoDetails.type = "compare";
          return repoDetails;
        });
      }
    }

    return new Promise((resolve, reject) => {
      resolve(repoDetails);
    });
  };
}
