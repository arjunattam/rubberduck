import { createReducer } from "redux-create-reducer";

const initialState = {
  initialized: false,
  clientId: null,
  jwt: null
};

export default createReducer(initialState, {
  ["SET_FROM_CHROME_STORAGE"](state, action) {
    return {
      ...state,
      ...action.payload,
      initialized: true
    };
  },
  ["UPDATE_FROM_CHROME_STORAGE"](state, action) {
    return {
      ...state,
      ...action.payload
    };
  }
});
