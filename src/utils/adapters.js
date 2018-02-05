// This is a set of utils for the github implementation (github adapter). See octotree for more depth
// https://github.com/buunguyen/octotree/blob/master/src/adapters/github.js#L76

export const getRepoFromPath = () => {
  try {
    // (username)/(reponame)[/(type)][/(typeId)]
    const match = window.location.pathname.match(
      /([^\/]+)\/([^\/]+)(?:\/([^\/]+))?(?:\/([^\/]+))?/
    );
    return {
      username: match[1],
      reponame: match[2],
      type: match[3],
      typeId: match[4]
    };
  } catch (err) {
    console.log("getRepoFromPath crashed");
    return {};
  }
};
