import { WS } from "../utils/websocket";
import { API } from "../utils/api";
import * as AnalyticsUtils from "../utils/analytics";
import { loadUrl as pjaxLoadUrl } from "../utils/pjax";
import Store from "../store";
import { treeAdapter } from "../adapters";

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

export function updateSessionStatus(data) {
  return {
    type: "UPDATE_SESSION_STATUS",
    payload: data
  };
}

export function setRepoDetails(data) {
  return {
    type: "SET_REPO_DETAILS",
    payload: data
  };
}

export function setHoverResult(data) {
  return {
    type: "SET_HOVER_RESULT",
    payload: data
  };
}

export function setTreeLoading(data) {
  return {
    type: "SET_TREE_LOADING",
    payload: data
  };
}

function getTreeResponseHandler(repoDetails) {
  const { reponame, type } = repoDetails;
  switch (type) {
    case "pull":
    case "commit":
    case "compare":
      return response => treeAdapter.getPRChildren(reponame, response);
    default:
      return response => treeAdapter.getTreeChildren(reponame, response);
  }
}

export function callTree(repoDetails) {
  const handler = getTreeResponseHandler(repoDetails);
  AnalyticsUtils.logCall("tree");
  return {
    type: "CALL_TREE",
    payload: API.getTree(repoDetails)
      .then(response => {
        return {
          ...response,
          data: handler(response.data),
          raw: response.data
        };
      })
      .then(response => {
        AnalyticsUtils.logResponse("tree");
        return response;
      })
  };
}

export function callTreePages(repoDetails, firstPageData, pageNumbers) {
  const handler = getTreeResponseHandler(repoDetails);
  return {
    type: "CALL_TREE_PAGES",
    payload: API.getTreePages(repoDetails, pageNumbers).then(response => {
      return handler(response.concat(firstPageData));
    })
  };
}

export function callHover(data) {
  const { fileSha, filePath, lineNumber, charNumber } = data;
  const ANALYTICS_NAME = "hover";
  AnalyticsUtils.logCall(ANALYTICS_NAME);
  return {
    type: "CALL_HOVER",
    payload: WS.getHover(fileSha, filePath, lineNumber, charNumber).then(
      response => {
        AnalyticsUtils.logResponse(ANALYTICS_NAME);
        return response;
      }
    )
  };
}

const isTreeTooBig = () => {
  const ACCEPTABLE_TREE_COVERAGE = 0.35;
  const treeElement = document.querySelector("div.tree-content");
  const sidebarElement = document.querySelector("div.sidebar-container");
  if (treeElement && sidebarElement) {
    const treeCoverage = treeElement.offsetHeight / sidebarElement.offsetHeight;
    return treeCoverage >= ACCEPTABLE_TREE_COVERAGE;
  }
  return false;
};

export function callDefinitions(data) {
  const { fileSha, filePath, lineNumber, charNumber } = data;
  const { status } = Store.getState().data.session;
  const ANALYTICS_NAME = "definition";
  AnalyticsUtils.logCall(ANALYTICS_NAME);
  return {
    type: "CALL_DEFINITIONS",
    payload: WS.getDefinition(fileSha, filePath, lineNumber, charNumber).then(
      response => {
        AnalyticsUtils.logResponse(ANALYTICS_NAME);
        return response;
      }
    ),
    meta: {
      shouldCollapse: isTreeTooBig() && status === "ready",
      hoverResult: data
    }
  };
}

export function callUsages(data) {
  const { fileSha, filePath, lineNumber, charNumber } = data;
  const ANALYTICS_NAME = "usages";
  AnalyticsUtils.logCall(ANALYTICS_NAME);
  return {
    type: "CALL_USAGES",
    payload: WS.getUsages(fileSha, filePath, lineNumber, charNumber).then(
      response => {
        AnalyticsUtils.logResponse(ANALYTICS_NAME);
        return response;
      }
    )
  };
}

export function callFileContents(data) {
  const { baseOrHead, filePath } = data;
  const existingContents = Store.getState().data.fileContents;
  const fileContents = existingContents[baseOrHead][filePath];
  const noOpPromise = new Promise((resolve, reject) => {
    resolve({
      ...data,
      result: { contents: fileContents }
    });
  });
  const apiCallPromise = new Promise((resolve, reject) => {
    const ANALYTICS_NAME = "file_contents";
    AnalyticsUtils.logCall(ANALYTICS_NAME);
    WS.getFileContents(baseOrHead, filePath)
      .then(response => {
        AnalyticsUtils.logResponse(ANALYTICS_NAME);
        return response;
      })
      .then(response => resolve(response))
      .catch(error => reject(error));
  });

  return {
    type: "CALL_FILE_CONTENTS",
    payload: fileContents ? noOpPromise : apiCallPromise
  };
}

export function loadUrl({ urlPath }) {
  return {
    type: "LOAD_PJAX_URL",
    payload: new Promise((resolve, reject) => {
      pjaxLoadUrl(urlPath, () => {
        resolve();
      });
    })
  };
}
