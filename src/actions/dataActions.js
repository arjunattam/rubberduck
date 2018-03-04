import { API } from "../utils/api";
import { encodeToBase64 } from "../utils/data";

export function updateData(data) {
  return {
    type: "UPDATE_DATA",
    payload: data
  };
}

export function createSession(data) {
  return {
    type: "CREATE_SESSION",
    payload: API.createSession(
      data.prNumber,
      data.username,
      data.reponame
    ).then(response => {
      let prId = encodeToBase64(
        `${data.username}/${data.reponame}/${data.prNumber}`
      );
      return {
        response,
        data: prId
      };
    })
  };
}

export function setRepoDetails(data) {
  return {
    type: "SET_REPO_DETAILS",
    payload: data
  };
}

export function setFileTree(data) {
  return {
    type: "SET_FILE_TREE",
    payload: data
  };
}

export function updateSessionStatus(data) {
  return {
    type: "UPDATE_SESSION_STATUS",
    payload: data
  };
}
