import { WS } from "../utils/websocket";
import { encodeToBase64 } from "../utils/data";

export function updateData(data) {
  return {
    type: "UPDATE_DATA",
    payload: data
  };
}

export function createNewSession(data) {
  return {
    type: "CREATE_NEW_SESSION",
    payload: WS.createNewSession(data.params)
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

export function setTreeLoading(data) {
  return {
    type: "SET_TREE_LOADING",
    payload: data
  };
}
