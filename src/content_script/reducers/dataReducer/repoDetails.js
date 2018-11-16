import { createReducer } from "redux-create-reducer";

export default createReducer(
  {},
  {
    SET_REPO_DETAILS: (state, action) => ({
      ...state,
      ...action.payload
    })
  }
);
