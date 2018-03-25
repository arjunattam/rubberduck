import React from "react";
import { connect } from "react-redux";
import { bindActionCreators } from "redux";
import { API } from "../utils/api";
import { WS } from "../utils/websocket";
import * as DataActions from "../actions/dataActions";
import * as StorageActions from "../actions/storageActions";
import Sidebar from "./Sidebar";
import * as ChromeUtils from "./../utils/chrome";
import * as StorageUtils from "./../utils/storage";
import { Authorization } from "./../utils/authorization";
import { pathAdapter, treeAdapter } from "../adapters";

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
  }

  componentDidUpdate(prevProps, prevState) {
    if (!prevProps.storage.initialized && this.props.storage.initialized) {
      this.setupAuthorization();
    }
    let isSameSessionPath = pathAdapter.isSameSessionPath(
      prevProps.data.repoDetails,
      this.props.data.repoDetails
    );
    let hasTokenChanged = prevProps.storage.token !== this.props.storage.token;
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
    this.updateRepoDetailsFromPath();
  }

  updateRepoDetailsFromPath() {
    pathAdapter.fetchRepoDetails().then(repoDetails => {
      this.DataActions.setRepoDetails(repoDetails);
    });
  }

  handleSessionInitialization() {
    const repoDetails = this.props.data.repoDetails;
    if (repoDetails.username && repoDetails.reponame) {
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
    const pullId = repoDetails.prId || 14; // TODO(arjun): infer this
    const branch = repoDetails.branch || "master";
    this.DataActions.setTreeLoading(true);
    if (type === "pull" || type === "pull-requests") {
      return API.getPRFiles(username, reponame, pullId).then(response => {
        console.log("response", response);
        return treeAdapter.getPRChildren(reponame, response);
      });
    } else {
      return API.getFilesTree(username, reponame, branch).then(response => {
        return treeAdapter.getTreeChildren(reponame, response);
      });
    }
  }

  handleFileTreeUpdate() {
    let repoDetails = this.props.data.repoDetails;

    if (repoDetails.username && repoDetails.reponame) {
      // Repo details have been figured
      const { username, reponame } = repoDetails;
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
    console.log(this.props.data);
    return this.props.data.repoDetails.reponame ? <Sidebar /> : null;
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
