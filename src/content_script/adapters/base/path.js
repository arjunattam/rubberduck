export default class BasePathAdapter {
  static constructFilePath = (subPath, orgname, reponame, branch) => {
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
      type: null,
      prId: null,
      branch: null,
      headSha: null,
      baseSha: null,
      path: null
    };

    return new Promise((resolve, reject) => {
      resolve(repoDetails);
    });
  };
}
