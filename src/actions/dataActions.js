import { WS } from "../utils/websocket";
import { API } from "../utils/api";

export function updateData(data) {
  return {
    type: "UPDATE_DATA",
    payload: data
  };
}

export function setOpenSection(data) {
  return {
    type: "SET_OPEN_SECTION",
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

export function setHoverResult(data) {
  return {
    type: "SET_HOVER_RESULT",
    payload: data
  };
}

export function callTree(data) {
  return {
    type: "CALL_TREE",
    payload: API.getTree(data)
  };
}

export function callHover(data) {
  const { fileSha, filePath, lineNumber, charNumber } = data;
  return {
    type: "CALL_HOVER",
    payload: WS.getHover(fileSha, filePath, lineNumber, charNumber)
  };
}

export function callDefinitions(data) {
  const { fileSha, filePath, lineNumber, charNumber } = data;
  return {
    type: "CALL_DEFINITIONS",
    payload: WS.getDefinition(fileSha, filePath, lineNumber, charNumber)
  };
}

export function callUsages(data) {
  const { fileSha, filePath, lineNumber, charNumber } = data;
  return {
    type: "CALL_USAGES",
    payload: WS.getReferences(fileSha, filePath, lineNumber, charNumber)
  };
}

export function callFileContents(data) {
  const { fileSha, filePath } = data;
  return {
    type: "CALL_FILE_CONTENTS",
    payload: WS.getFileContents(fileSha, filePath)
  };
}
