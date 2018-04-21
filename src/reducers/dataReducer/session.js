import { createReducer } from "redux-create-reducer";

const initialState = {
  payload: {},
  status: "",
  showNotReady: null
};

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
  UPDATE_SESSION_STATUS: (state, action) => {
    if (action.payload.status === "not_ready") {
      // This is handled differently. Not saved as the status.
      return {
        ...state,
        showNotReady: new Date()
      };
    } else {
      return {
        ...state,
        status: action.payload.status
      };
    }
  }
});
