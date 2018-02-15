import { createReducer } from "redux-create-reducer";

const initialState = {
  jwt: "",
  clientId: "",
  session: {}
};

export default createReducer(initialState, {
  ["UPDATE_JWT"](state, action) {
    return {
      ...state,
      jwt: action.payload
    };
  },
  ["UPDATE_CLIENT_ID"](state, action) {
    return {
      ...state,
      clientId: action.payload
    };
  },
  ["UPDATE_SESSION_FULFILLED"](state, action) {
    console.log("Action", state, action);
    return {
      ...state,
      session: {
        ...state.session,
        [action.payload.data]: action.payload.response
      }
    };
  }
});
