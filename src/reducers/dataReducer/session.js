import { createReducer } from "redux-create-reducer";

const initialState = {
  payload: {},
  status: "",
  progress: null,
  showNotReady: null
};

function updateNotReady(state, action) {
  const newNotReady =
    state.status !== "ready" ? { showNotReady: new Date() } : {};
  return {
    ...state,
    ...newNotReady
  };
}

export default createReducer(initialState, {
  CREATE_NEW_SESSION_FULFILLED: (state, action) => {
    console.log("Session created", action.payload);
    return {
      ...state,
      payload: {
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
  UPDATE_SESSION_STATUS: (state, action) => ({
    ...state,
    status: action.payload.status,
    progress: action.payload.progress
  }),

  // We are not updating for usages, since usages and definitions happen together
  CALL_DEFINITIONS_PENDING: (state, action) => updateNotReady(state, action),
  CALL_HOVER_PENDING: (state, action) => updateNotReady(state, action)
});
