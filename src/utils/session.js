import * as GitAdapter from "../adapters/github/path";
import { encodeToBase64 } from "../utils/data";

export const getPullRequestIdFromPath = () => {
  let { reponame, username, type, typeId } = GitAdapter.getRepoFromPath();
  if (reponame && username && type === "pull" && typeId) {
    return encodeToBase64(`${username}/${reponame}/${typeId}`);
  }
  return null;
};

export const getCurrentSessionId = sessions => {
  let currentPullRequestId = getPullRequestIdFromPath();
  if (currentPullRequestId) {
    return sessions[currentPullRequestId] && sessions[currentPullRequestId].id;
  }
};
