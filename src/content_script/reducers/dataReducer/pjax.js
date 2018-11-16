import { createReducer } from "redux-create-reducer";

const initialState = {
  isLoading: false
};

export default createReducer(initialState, {
  LOAD_PJAX_URL_PENDING: (state, action) => {
    return {
      ...state,
      isLoading: true
    };
  },
  LOAD_PJAX_URL_FULFILLED: (state, action) => {
    return {
      ...state,
      isLoading: false
    };
  }
});
