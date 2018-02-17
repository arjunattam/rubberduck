import { createReducer } from "redux-create-reducer";

const initialState = {
  sessions: {},
  repoDetails: {},
  openSection: "tree",
  textSelection: {},
  isSidebarVisible: true
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
  UPDATE_DATA: (state, action) => {
    return {
      ...state,
      ...action.payload
    };
  }
});
