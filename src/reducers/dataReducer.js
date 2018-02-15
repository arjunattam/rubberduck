import { createReducer } from "redux-create-reducer";

const initialState = {
  sessions: {},
  repoDetails: {}
};

export default createReducer(initialState, {
  ["CREATE_SESSION_FULFILLED"](state, action) {
    return {
      ...state,
      sessions: {
        ...state.sessions,
        [action.payload.data]: action.payload.response
      }
    };
  },
  ["SET_REPO_DETAILS"](state, action) {
    return {
      ...state,
      repoDetails: {
        ...state.repoDetails,
        ...action.payload
      }
    };
  },
  ["UPDATE_DATA"](state, action) {
    return {
      ...state,
      ...action.payload
    };
  }
});
