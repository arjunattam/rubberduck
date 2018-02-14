import { createReducer } from "redux-create-reducer";

const initialState = {
  jwt: "",
  clientId: ""
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
  }
});
