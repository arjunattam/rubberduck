import { createReducer } from "redux-create-reducer";

const initialState = {
  openSection: {
    tree: true,
    usages: false,
    definitions: false
  },
  isLoading: {
    tree: false,
    hover: false,
    usages: false,
    definitions: false
  }
};

function updateIsLoading(state, newIsLoading, newOpenSection) {
  return {
    ...state,
    isLoading: {
      ...state.isLoading,
      ...newIsLoading
    },
    openSection: {
      ...state.openSection,
      ...newOpenSection
    }
  };
}

export default createReducer(initialState, {
  SET_OPEN_SECTION: (state, action) =>
    updateIsLoading(state, {}, action.payload),

  SET_TREE_LOADING: (state, action) =>
    updateIsLoading(state, { tree: action.payload }),

  CALL_TREE_PENDING: (state, action) => updateIsLoading(state, { tree: true }),

  CALL_TREE_FULFILLED: (state, action) =>
    updateIsLoading(state, { tree: false }),

  CALL_TREE_REJECTED: (state, action) =>
    updateIsLoading(state, { tree: false }),

  CALL_DEFINITIONS_PENDING: (state, action) =>
    updateIsLoading(state, { definitions: true }),

  CALL_DEFINITIONS_FULFILLED: (state, action) =>
    updateIsLoading(state, { definitions: false }, { definitions: true }),

  CALL_DEFINITIONS_REJECTED: (state, action) =>
    updateIsLoading(state, { definitions: false }),

  CALL_USAGES_PENDING: (state, action) =>
    updateIsLoading(state, { usages: true }),

  CALL_USAGES_FULFILLED: (state, action) =>
    updateIsLoading(state, { usages: false }, { usages: true }),

  CALL_USAGES_REJECTED: (state, action) =>
    updateIsLoading(state, { usages: false }),

  CALL_HOVER_PENDING: (state, action) =>
    updateIsLoading(state, { hover: true }),

  CALL_HOVER_FULFILLED: (state, action) =>
    updateIsLoading(state, { hover: false }),

  CALL_HOVER_REJECTED: (state, action) =>
    updateIsLoading(state, { hover: false })
});
