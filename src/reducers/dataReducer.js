import { createReducer } from "redux-create-reducer";

const initialState = {
  sessions: {},
  repoDetails: {},
  openSection: "tree",
  textSelection: {},

  // Sidebar visible
  isSidebarVisible: true,

  // Files tree
  fileTree: {
    name: "",
    path: "",
    children: []
  },
  isTreeLoading: false,

  // These are used to show session status
  sessionStatus: "",
  showNotReady: null,

  // Triggers the 401 pop-up
  isUnauthenticated: false
};

export default createReducer(initialState, {
  CREATE_SESSION_FULFILLED: (state, action) => {
    return {
      ...state,
      sessions: {
        ...state.sessions,
        [action.payload.data]: action.payload.response
      }
    };
  },
  CREATE_SESSION_REJECTED: (state, action) => {
    console.log("Session creation failed", action.payload);
    return {
      ...state
    };
  },
  SET_REPO_DETAILS: (state, action) => {
    return {
      ...state,
      repoDetails: {
        ...state.repoDetails,
        ...action.payload
      }
    };
  },
  SET_FILE_TREE: (state, action) => {
    return {
      ...state,
      fileTree: {
        ...state.fileTree,
        ...action.payload
      }
    };
  },
  SET_TREE_LOADING: (state, action) => {
    return {
      ...state,
      isTreeLoading: action.payload
    };
  },
  UPDATE_SESSION_STATUS: (state, action) => {
    if (action.sessionStatus === "not_ready") {
      // This is handled differently. Not saved as the status.
      return {
        ...state,
        showNotReady: new Date()
      };
    } else {
      return {
        ...state,
        sessionStatus: action.sessionStatus
      };
    }
  },
  UPDATE_IS_UNAUTHENTICATED: (state, action) => {
    return {
      ...state,
      isUnauthenticated: action.isUnauthenticated
    };
  },
  UPDATE_DATA: (state, action) => {
    return {
      ...state,
      ...action.payload
    };
  }
});
