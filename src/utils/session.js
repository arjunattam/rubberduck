import * as GitAdapter from "../adapters/github/path";

export const getPullRequestIdFromPath = () => {
  let { reponame, username, type, typeId } = GitAdapter.getRepoFromPath();
  if (reponame && username && type === "pull" && typeId) {
    return `${username}/${reponame}/${typeId}`;
  }
  return null;
};

export const getCurrentSession = sessions => {
  let currentPullRequestId = getPullRequestIdFromPath();
  if (currentPullRequestId) {
    return sessions[currentPullRequestId];
  }
};
