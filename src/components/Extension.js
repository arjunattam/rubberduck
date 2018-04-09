import React from "react";
import { connect } from "react-redux";
import { bindActionCreators } from "redux";
import { API } from "../utils/api";
import { WS } from "../utils/websocket";
import * as DataActions from "../actions/dataActions";
import * as StorageActions from "../actions/storageActions";
import Sidebar from "./sidebar";
import * as ChromeUtils from "./../utils/chrome";
import * as StorageUtils from "./../utils/storage";
import { Authorization } from "./../utils/authorization";
import { pathAdapter, treeAdapter } from "../adapters";
import { fillUpSpans } from "../adapters/base/codespan";

let document = window.document;

class Extension extends React.Component {
  constructor(props) {
    super(props);
    this.DataActions = bindActionCreators(DataActions, this.props.dispatch);
    this.StorageActions = bindActionCreators(
      StorageActions,
      this.props.dispatch
    );
  }

  componentDidMount() {
    this.setupChromeListener();
    this.initializeStorage();
    this.updateRepoDetailsFromPath();
    fillUpSpans(document);
  }

  componentDidUpdate(prevProps, prevState) {
    if (!prevProps.storage.initialized && this.props.storage.initialized) {
      this.setupAuthorization();
    }
    this.updateSessionAndTree(prevProps, this.props);
  }

  updateSessionAndTree(prevProps, newProps) {
    let isSameSessionPath = pathAdapter.isSameSessionPath(
      prevProps.data.repoDetails,
      newProps.data.repoDetails
    );
    let hasTokenChanged = prevProps.storage.token !== newProps.storage.token;
    if (hasTokenChanged || !isSameSessionPath) {
      this.handleSessionInitialization();
      this.handleFileTreeUpdate();
    }
  }

  setupChromeListener() {
    // Setup the chrome message passing listener for
    // messages from the background.
    ChromeUtils.addChromeListener((action, data) => {
      if (ChromeUtils.CONTEXT_MENU_MESSAGE_TYPES.includes(action)) {
        this.handleContextMenuTrigger(action);
      } else if (action === "URL_UPDATE") {
        this.handleUrlUpdate(data);
      } else if (action === "STORAGE_UPDATED") {
        this.handleStorageUpdate(data);
      }
    });
  }

  initializeStorage() {
    StorageUtils.getAllFromStore(storageData => {
      this.StorageActions.setFromChromeStorage(storageData);
    });
  }

  setupAuthorization() {
    let clientId =
      this.props.storage.clientId || Authorization.generateClientId();
    let existingToken = this.props.storage.token;
    Authorization.handleTokenState(clientId, existingToken).then(token => {
      StorageUtils.setAllInStore({ token, clientId }, () => {});
    });
  }

  handleStorageUpdate(data) {
    console.log("Storage changes via listener", data);
    this.StorageActions.updateFromChromeStorage(data);
  }

  handleUrlUpdate() {
    // Due to pjax, there are cases when the url has been updated but
    // the DOM elements have not loaded up, so repoDetails cannot be calculated
    // Hence we keep a timeout of 1 sec.
    setTimeout(() => {
      this.updateRepoDetailsFromPath();
      fillUpSpans(document);
    }, 1000);
  }

  updateRepoDetailsFromPath() {
    pathAdapter.fetchRepoDetails().then(repoDetails => {
      this.DataActions.setRepoDetails(repoDetails);
    });
  }

  handleSessionInitialization() {
    const repoDetails = this.props.data.repoDetails;
    const hasSessionParams =
      repoDetails.prId || repoDetails.headSha || repoDetails.branch;

    if (repoDetails.username && repoDetails.reponame && hasSessionParams) {
      const params = {
        organisation: repoDetails.username,
        name: repoDetails.reponame,
        pull_request_id: repoDetails.prId,
        type: repoDetails.type,
        head_sha: repoDetails.headSha || repoDetails.branch,
        base_sha: repoDetails.baseSha
      };

      if (this.props.storage.token) {
        WS.createNewSession(params)
          .then(response => {
            console.log("Session created", response);
          })
          .catch(error => {
            console.log("Error in creating session", error);
          });
      }
    }
  }

  getFileTreeAPI(repoDetails) {
    const { username, reponame, type } = repoDetails;
    this.DataActions.setTreeLoading(true);

    if (type === "pull") {
      const { prId } = repoDetails;
      return API.getPRFiles(username, reponame, prId).then(response =>
        treeAdapter.getPRChildren(reponame, response)
      );
    } else if (type === "commit") {
      const { headSha } = repoDetails;
      return API.getCommitFiles(username, reponame, headSha).then(response =>
        treeAdapter.getPRChildren(reponame, response)
      );
    } else if (type === "compare") {
      const { headSha, baseSha } = repoDetails;
      return API.getCompareFiles(username, reponame, headSha, baseSha).then(
        response => treeAdapter.getPRChildren(reponame, response)
      );
    } else {
      const branch = repoDetails.branch || "master"; // TODO(arjun): check for default branch
      return API.getFilesTree(username, reponame, branch).then(response =>
        treeAdapter.getTreeChildren(reponame, response)
      );
    }
  }

  handleFileTreeUpdate() {
    let repoDetails = this.props.data.repoDetails;

    if (repoDetails.username && repoDetails.reponame) {
      // Repo details have been figured
      if (this.props.storage.token) {
        this.getFileTreeAPI(repoDetails)
          .then(fileTreeData => {
            this.DataActions.setTreeLoading(false);
            this.DataActions.setFileTree(fileTreeData);
          })
          .catch(error => {
            // TODO(arjun): this needs to be better communicated
            this.DataActions.setTreeLoading(false);
            console.log("Error in API call", error);
          });
      }
    }
  }

  handleContextMenuTrigger(action) {
    const actionSections = {
      REFERENCES_TRIGGER: "references",
      DEFINITIONS_TRIGGER: "definitions"
    };

    const selection = document.getSelection();
    const selectionRects =
      selection && selection.rangeCount > 0
        ? document
            .getSelection()
            .getRangeAt(0)
            .getClientRects()
        : [];
    if (selectionRects.length > 0) {
      const rect = selectionRects[0];
      const x = rect.left + (rect.right - rect.left) / 2;
      const y = rect.top + (rect.bottom - rect.top) / 2;
      this.DataActions.updateData({
        openSection: actionSections[action],
        textSelection: { x: x, y: y }
      });
    }
  }

  render() {
    const { reponame } = this.props.data.repoDetails;
    const willRenderSidebar = reponame !== null && reponame !== undefined;
    return willRenderSidebar ? <Sidebar /> : null;
  }
}

function mapStateToProps(state) {
  const { storage, data } = state;
  return {
    storage,
    data
  };
}
export default connect(mapStateToProps)(Extension);
