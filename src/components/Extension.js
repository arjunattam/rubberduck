import React from "react";
import { connect } from "react-redux";
import { bindActionCreators } from "redux";
import * as DataActions from "../actions/dataActions";
import * as StorageActions from "../actions/storageActions";
import Sidebar from "./sidebar";
import * as ChromeUtils from "./../utils/chrome";
import * as StorageUtils from "./../utils/storage";
import Authorization from "./../utils/authorization";
import { pathAdapter } from "../adapters";
import { setupObserver as setupSpanObserver } from "../adapters/base/codespan";

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
    setupSpanObserver();
  }

  componentDidUpdate(prevProps, prevState) {
    const { initialized: prevInitialized } = prevProps.storage;
    const { initialized: newInitialized } = this.props.storage;
    const hasLoadedStorage = !prevInitialized && newInitialized;

    if (hasLoadedStorage) {
      // Checking to trigger this only after chrome storage is loaded
      this.setupAuthorization();
    }

    // TODO(arjun): should this happen only after auth has been setup?
    this.updateSessionAndTree(prevProps, this.props);
  }

  updateSessionAndTree(prevProps, newProps) {
    const { repoDetails: prev } = prevProps.data;
    const { repoDetails: now } = newProps.data;
    let hasSessionChanged = !pathAdapter.isSameSessionPath(prev, now);
    const hasAuthChanged = Authorization.hasChanged(
      prevProps.storage,
      newProps.storage
    );
    if (hasAuthChanged || hasSessionChanged) {
      this.initializeSession();
      this.initializeFileTree();
    }
  }

  setupChromeListener() {
    ChromeUtils.addChromeListener((action, data) => {
      if (action === "URL_UPDATE") {
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
    return Authorization.setup();
  }

  handleStorageUpdate(data) {
    this.StorageActions.updateFromChromeStorage(data);
  }

  handleUrlUpdate() {
    // Due to pjax, there are cases when the url has been updated but
    // the DOM elements have not loaded up, so repoDetails cannot be calculated
    // Hence we keep a timeout of 1 sec.

    // TODO(arjun): need to listen to pjax end event here, instead of random constant
    setTimeout(() => {
      this.updateRepoDetailsFromPath();
    }, 1000);
    setupSpanObserver();
  }

  updateRepoDetailsFromPath() {
    pathAdapter.fetchRepoDetails().then(repoDetails => {
      this.DataActions.setRepoDetails(repoDetails);
    });
  }

  hasValidToken = () => Authorization.hasValidToken();

  initializeSession() {
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

      if (this.hasValidToken()) {
        this.DataActions.createNewSession({ params });
      }
    }
  }

  initializeFileTree() {
    let repoDetails = this.props.data.repoDetails;

    if (repoDetails.username && repoDetails.reponame) {
      if (this.hasValidToken()) {
        this.DataActions.callTree(repoDetails).then(response => {
          const { payload } = response.action;
          if (payload && payload.nextPage && payload.lastPage) {
            // We were not able to load the entire tree because API is paginated
            let pages = [];
            for (let i = payload.nextPage; i <= payload.lastPage; i++) {
              pages.push(i);
            }
            const firstPageRaw = payload.raw;
            this.DataActions.callTreePages(repoDetails, firstPageRaw, pages);
          }
        });
      }
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
