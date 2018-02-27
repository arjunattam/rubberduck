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

class Extension extends React.Component {
  constructor(props) {
    super(props);
    this.state = {};
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

  componentDidUpdate(prevProps) {
    if (!prevProps.storage.initialized && this.props.storage.initialized) {
      this.setupAuthorization();
    }
    if (!prevProps.storage.token && this.props.storage.token) {
      this.handleSessionInitialization();
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
    this.setupJWT(clientId);
  }

  setupJWT(clientId) {
    let existingToken = this.props.storage.token;
    if (existingToken) {
      API.refreshTokenBackground(existingToken).then(response => {
        this.handleTokenUpdate(response.token, clientId);
      });
    } else {
      API.issueToken(clientId).then(response => {
        this.handleTokenUpdate(response.token, clientId);
      });
    }
  }

  handleTokenUpdate(token, clientId) {
    StorageUtils.setAllInStore({ token, clientId }, () => {
      // this.handleSessionInitialization();
    });
  }

  handleStorageUpdate(data) {
    console.log("Storage changes via listener", data);
    this.StorageActions.updateFromChromeStorage(data);
  }

  handleUrlUpdate() {
    // Disabling this for now -- to prevent two calls for session creation
    // this.handleSessionInitialization();
  }

  updateRepoDetailsFromPath() {
    this.DataActions.setRepoDetails(GitPathAdapter.getRepoFromPath());
  }

  handleSessionInitialization() {
    this.DataActions.setRepoDetails(GitPathAdapter.getRepoFromPath());
    let { type, typeId, username, reponame } = GitPathAdapter.getRepoFromPath();
    if (type === "pull" && username && reponame && typeId) {
      let prId = btoa(`${username}/${reponame}/${typeId}`);
      WS.createSession(typeId, username, reponame);
      // if (!this.props.storage.sessions[prId] && this.props.storage.token) {
      //   API.createSession(typeId, username, reponame).then(response => {
      //     let prId = btoa(`${username}/${reponame}/${typeId}`);
      //     let sessions = {
      //       ...this.props.storage.sessions,
      //       [prId]: { ...response }
      //     };
      //     StorageUtils.setAllInStore({ sessions }, res => {
      //       console.log("Sessions set in store", sessions, res);
      //     });
      //   });
      // }
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
