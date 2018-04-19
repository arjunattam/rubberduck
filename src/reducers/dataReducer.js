import { createReducer } from "redux-create-reducer";
import { isTreeTooBig } from "./utils";

const initialState = {
  repoDetails: {},

  // Section states
  openSection: {
    tree: true,
    references: false,
    definitions: false
  },
  isLoading: {
    tree: false,
    references: false,
    definitions: false
  },

  // Current usages + definitions
  hoverResult: {},

  // Files tree
  fileTree: {
    name: "",
    path: "",
    children: []
  },

  // These are used to show session status
  // and for the `open file` link
  session: {},
  sessionStatus: "",
  showNotReady: null,

  // Triggers the 401 pop-up
  isUnauthenticated: false
};

export default createReducer(initialState, {
  CREATE_NEW_SESSION_FULFILLED: (state, action) => {
    console.log("Session created", action.payload);
    return {
      ...state,
      session: {
        ...action.payload
      }
    };
  },
  CREATE_NEW_SESSION_REJECTED: (state, action) => {
    console.log("Session creation failed", action.payload);
    return {
      ...state
    };
  },
  CALL_TREE_PENDING: (state, action) => {
    return {
      ...state,
      isLoading: {
        ...state.isLoading,
        tree: true
      }
    };
  },
  CALL_TREE_FULFILLED: (state, action) => {
    return {
      ...state,
      isLoading: {
        ...state.isLoading,
        tree: false
      }
    };
  },
  CALL_TREE_REJECTED: (state, action) => {
    return {
      ...state,
      isLoading: {
        ...state.isLoading,
        tree: false
      }
    };
  },
  CALL_DEFINITIONS_PENDING: (state, action) => {
    return {
      ...state,
      isLoading: {
        ...state.isLoading,
        definitions: true
      }
    };
  },
  CALL_DEFINITIONS_FULFILLED: (state, action) => {
    const treeOpen = isTreeTooBig() ? { tree: false } : {};
    return {
      ...state,
      isLoading: {
        ...state.isLoading,
        definitions: false
      },
      openSection: {
        ...state.openSection,
        definitions: true,
        ...treeOpen
      }
    };
  },
  CALL_DEFINITIONS_REJECTED: (state, action) => {
    return {
      ...state,
      isLoading: {
        ...state.isLoading,
        definitions: false
      }
    };
  },
  CALL_REFERENCES_PENDING: (state, action) => {
    return {
      ...state,
      isLoading: {
        ...state.isLoading,
        references: true
      }
    };
  },
  CALL_REFERENCES_FULFILLED: (state, action) => {
    const treeOpen = isTreeTooBig() ? { tree: false } : {};
    return {
      ...state,
      isLoading: {
        ...state.isLoading,
        references: false
      },
      openSection: {
        ...state.openSection,
        references: true,
        ...treeOpen
      }
    };
  },
  CALL_REFERENCES_REJECTED: (state, action) => {
    return {
      ...state,
      isLoading: {
        ...state.isLoading,
        references: false
      }
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
  UPDATE_DATA: (state, action) => {
    return {
      ...state,
      ...action.payload
    };
  }
});
