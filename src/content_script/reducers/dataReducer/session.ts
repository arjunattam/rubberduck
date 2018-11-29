import { createReducer } from "redux-create-reducer";

const initialState = {
  payload: {},
  status: "",
  progress: null
};

export default createReducer(initialState, {
  CREATE_NEW_SESSION_FULFILLED: (state, action: any) => {
    return {
      ...state,
      payload: { ...action.payload },
      status: "ready"
    };
  },
  CREATE_NEW_SESSION_REJECTED: (state, action: any) => {
    return {
      ...state
    };
  },
  UPDATE_SESSION_STATUS: (state, action: any) => ({
    ...state,
    status: action.payload.status,
    progress: action.payload.progress
  })
});
