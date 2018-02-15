import { API } from "../utils/api";

export function updateData(data) {
  return {
    type: "UPDATE_DATA",
    payload: data
  };
}

export function updateJWT(data) {
  return {
    type: "UPDATE_JWT",
    payload: data
  };
}

export function updateClientId(data) {
  return {
    type: "UPDATE_CLIENT_ID",
    payload: data
  };
}

export function updateSession(data) {
  return {
    type: "UPDATE_SESSION",
    payload: API.createSession(
      data.pullRequestId,
      data.organization,
      data.repoName
    ).then(response => {
      return {
        response,
        data: `${data.organization}/${data.repoName}/${data.pullRequestId}`
      };
    })
  };
}
