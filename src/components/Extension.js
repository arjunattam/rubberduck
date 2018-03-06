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
import * as GitPathAdapter from "../adapters/github/path";
import * as DataUtils from "../utils/data";

const Pjax = require("pjax");
let document = window.document;

let GlobalPjax;
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
    this.updateRepoDetailsFromPath();
    this.setupChromeListener();
    this.initializeStorage();
  }

  componentDidUpdate(prevProps, prevState) {
    if (!prevProps.storage.initialized && this.props.storage.initialized) {
      this.setupAuthorization();
    }
    let isSameSessionPath = GitPathAdapter.isSameSessionPath(
      prevProps.data.repoDetails,
      this.props.data.repoDetails
    );
    if (
      prevProps.storage.token !== this.props.storage.token ||
      !isSameSessionPath
    ) {
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
    this.DataActions.setRepoDetails(GitPathAdapter.getRepoFromPath());
  }

  handleSessionInitialization() {
    const repoDetails = this.props.data.repoDetails;
    if (repoDetails.username && repoDetails.reponame) {
      const params = {
        organisation: repoDetails.username,
        name: repoDetails.reponame,
        pull_request_id: repoDetails.typeId,
        type: repoDetails.type,
        head_sha: repoDetails.branch
      };

      if (params.type === "commit") {
        const { base, head } = GitPathAdapter.getCommitViewSha();
        params.head_sha = head;
        params.base_sha = base;
      } else if (params.type === "compare") {
        const { base, head } = GitPathAdapter.getCompareViewSha();
        params.head_sha = head;
        params.base_sha = base;
      }

      if (this.props.storage.token) {
        WS.createSession(params).then(response => {
          console.log("created session", response);
        });
      }
    }
  }

  getFileTreeAPI(repoDetails) {
    const { username, reponame, type } = repoDetails;
    const pullId = repoDetails.typeId;
    const branch = repoDetails.branch || "master";
    if (type === "pull") {
      return API.getPRFiles(username, reponame, pullId).then(response => {
        return DataUtils.getPRChildren(reponame, response);
      });
    } else {
      return API.getFilesTree(username, reponame, branch).then(response => {
        return DataUtils.getTreeChildren(reponame, response.tree);
      });
    }
  }

  handleFileTreeUpdate() {
    let repoDetails = this.props.data.repoDetails;

    if (repoDetails.username && repoDetails.reponame) {
      // Repo details have been figured
      const { username, reponame } = repoDetails;
      const pullId = repoDetails.typeId;
      const branch = repoDetails.branch || "master";

      this.getFileTreeAPI(repoDetails)
        .then(fileTreeData => {
          this.DataActions.setFileTree(fileTreeData);
          setTimeout(() => {
            GlobalPjax = new Pjax({
              elements: "a", // default is "a[href], form[action]"
              selectors: ["#js-repo-pjax-container"],
              disablePjaxHeader: true,
              cacheBust: false,
              currentUrlFullReload: false
            });
          }, 2000);
        })
        .catch(error => {
          // TODO(arjun): this needs to be better communicated
          console.log("Error in API call", error);
        });
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
    return <Sidebar />;
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
