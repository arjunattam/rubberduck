import { remoteAPI } from "../utils/api";
import * as NativeUtils from "../utils/native";
import { loadUrl as pjaxLoadUrl } from "../utils/pjax";
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

export function createNewSession(params: RemoteView) {
  return {
    type: "CREATE_NEW_SESSION",
    payload: NativeUtils.initialize(params)
  };
}

export function updateSessionStatus(data) {
  return {
    type: "UPDATE_SESSION_STATUS",
    payload: data
  };
}

export function setRepoDetails(data: RemoteView) {
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

  return {
    type: "CALL_TREE",
    payload: remoteAPI.getTree(repoDetails).then(response => {
      return {
        ...response,
        data: handler(response.data),
        raw: response.data
      };
    })
  };
}

export function callTreePages(repoDetails, firstPageData, pageNumbers) {
  const handler = getTreeResponseHandler(repoDetails);
  return {
    type: "CALL_TREE_PAGES",
    payload: remoteAPI.getTreePages(repoDetails, pageNumbers).then(response => {
      return handler(response.concat(firstPageData));
    })
  };
}

export function callHover(params: LanguageQueryParams) {
  return {
    type: "CALL_HOVER",
    payload: NativeUtils.hover(params)
  };
}

export function callDefinitions(params: LanguageQueryParams, hoverResult) {
  return {
    type: "CALL_DEFINITION",
    payload: NativeUtils.definition(params),
    meta: {
      shouldCollapse: isTreeTooBig(),
      hoverResult
    }
  };
}

export function callUsages(params: LanguageQueryParams, hoverResult) {
  return {
    type: "CALL_USAGES",
    payload: NativeUtils.references(params),
    meta: {
      hoverResult
    }
  };
}

export function callFileContents(
  filePath: string,
  baseOrHead,
  repoReference: RepoReference
) {
  // TODO: can we remove this if definitions/references fetch their own?
  const promise = new Promise(async (resolve, reject) => {
    const contents = await NativeUtils.contents(filePath, repoReference);
    resolve({
      // TODO: remove base or head from here
      baseOrHead,
      filePath,
      result: { contents }
    });
  });

  return {
    type: "CALL_FILE_CONTENTS",
    payload: promise
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

const isTreeTooBig = () => {
  const ACCEPTABLE_TREE_COVERAGE = 0.35;
  const treeElement = <HTMLElement>document.querySelector("div.tree-content");
  const sidebarElement = <HTMLElement>(
    document.querySelector("div.sidebar-container")
  );

  if (treeElement && sidebarElement) {
    const treeCoverage = treeElement.offsetHeight / sidebarElement.offsetHeight;
    return treeCoverage >= ACCEPTABLE_TREE_COVERAGE;
  }

  return false;
};
