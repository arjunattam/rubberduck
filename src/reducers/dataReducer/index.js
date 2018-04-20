import { createReducer } from "redux-create-reducer";
import { combineReducers } from "redux";
import section from "./section";
import repoDetails from "./repoDetails";
import fileTree from "./fileTree";
import hoverResult from "./hoverResult";

const initialState = {
  // Triggers the 401 pop-up
  isUnauthenticated: false,

  // These are used to show session status
  // and for the `open file` link
  session: {},
  sessionStatus: "",
  showNotReady: null
};

const data = createReducer(initialState, {
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

const dataReducer = combineReducers({
  data,
  fileTree,
  repoDetails,
  section,
  hoverResult
});

export default dataReducer;
