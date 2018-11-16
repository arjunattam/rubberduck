import BasePathAdapter from "../base/path";

const getRepoFromPath = () => {
  // 404 page, skip
  //   if ($(BB_404_SEL).length) {
  //     return cb();
  //   }

  // (username)/(reponame)[/(type)]
  const match = window.location.pathname.match(
    /([^\/]+)\/([^\/]+)(?:\/([^\/]+))?(?:\/([^\/]+))?/
  );
  //   if (!match) {
  //     return cb();
  //   }

  const username = match[1];
  const reponame = match[2];
  const type = match[3];
  const typeId = match[4] || null;

  // Not a repository, skip
  //   if (
  //     ~BB_RESERVED_USER_NAMES.indexOf(username) ||
  //     ~BB_RESERVED_REPO_NAMES.indexOf(reponame) ||
  //     ~BB_RESERVED_TYPES.indexOf(type)
  //   ) {
  //     return cb();
  //   }

  return {
    username: username,
    reponame: reponame,
    type: type,
    typeId: typeId
  };
};

const passthroughFeatureFlag = repoDetails => {
  if (repoDetails.type === "pull" && repoDetails.prId !== null) {
    return repoDetails;
  } else {
    return {
      username: null,
      reponame: null
    };
  }
};

export default class BitbucketPathAdapter extends BasePathAdapter {
  static fetchRepoDetails = () => {
    // Build the repo details object, with path parsing or API calls.
    // Return promise that will be saved in Redux store.
    let repoDetails = {
      username: null,
      reponame: null,
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
    repoDetails.type =
      repoFromPath.type === "pull-requests" ? "pull" : repoFromPath.type;
    repoDetails.prId =
      repoFromPath.type === "pull-requests" ? repoFromPath.typeId : null;

    // repoDetails.branch = getBranch() || null;

    // repoDetails.path = getFilePath();

    // Fill up base/head for types
    // if (repoDetails.type === "commit") {
    //   const { base, head } = getCommitViewSha();
    //   repoDetails.headSha = head;
    //   repoDetails.baseSha = base;
    // } else if (repoDetails.type === "compare") {
    //   const { base, head } = getCompareViewSha();
    //   repoDetails.headSha = head;
    //   repoDetails.baseSha = base;
    // } else if (repoDetails.type === "pull") {
    //   const shaPromise = getPRCommitSha();

    //   if (shaPromise !== null) {
    //     return shaPromise.then(shas => {
    //       repoDetails.headSha = shas.head;
    //       repoDetails.baseSha = shas.base;
    //       repoDetails.type = "compare";
    //       return repoDetails;
    //     });
    //   }
    // }

    return new Promise((resolve, reject) => {
      resolve(passthroughFeatureFlag(repoDetails));
    });
  };
}
