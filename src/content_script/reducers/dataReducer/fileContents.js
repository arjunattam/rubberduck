import { createReducer } from "redux-create-reducer";

const initialState = {
  base: {},
  head: {}
};

export default createReducer(initialState, {
  CALL_FILE_CONTENTS_FULFILLED: (state, action) => {
    const { baseOrHead, filePath, result } = action.payload;
    let newState = { ...state };
    newState[baseOrHead][filePath] = result.contents;
    return newState;
  }
});
