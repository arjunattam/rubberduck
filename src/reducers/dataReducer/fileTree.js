import { createReducer } from "redux-create-reducer";

const initialState = {
  name: "",
  path: "",
  children: []
};

export default createReducer(initialState, {
  SET_FILE_TREE: (state, action) => ({
    ...state,
    ...action.payload
  })
});
