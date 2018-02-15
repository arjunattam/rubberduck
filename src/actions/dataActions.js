import { API } from "../utils/api";

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
      let prId = btoa(`${data.username}/${data.reponame}/${data.prNumber}`);
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
