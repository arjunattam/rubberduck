import { createReducer } from "redux-create-reducer";

const initialState = {
  name: "",
  path: "",
  children: []
};

export default createReducer(initialState, {
  CALL_TREE_FULFILLED: (state, action) => {
    return {
      ...state,
      ...action.payload.data
    };
  },
  CALL_TREE_PAGES_FULFILLED: (state, action) => {
    return {
      ...state,
      ...action.payload
    };
  }
});
