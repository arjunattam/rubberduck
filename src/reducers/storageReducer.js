import { createReducer } from "redux-create-reducer";

const initialState = {
  initialized: false,
  clientId: null,
  token: null,

  // Sidebar props
  isSidebarVisible: true,
  sidebarWidth: 235,

  // Settings
  // (chrome.storage.local)
  hasHoverDebug: false,
  hasMenuApp: false,
  defaultPort: 9898,
  menuAppTokens: {},

  // API response caching: hash of url is the object key
  // (chrome.storage.local)
  apiResponses: {}
};

export default createReducer(initialState, {
  SET_FROM_CHROME_STORAGE: (state, action) => {
    return {
      ...state,
      ...action.payload,
      initialized: true
    };
  },

  UPDATE_FROM_CHROME_STORAGE: (state, action) => {
    if (!action.payload) return { ...state };
    let modifier = {};
    let hasChangeEnv = false;
    const { hasMenuApp: newEnv } = action.payload;

    if (newEnv !== undefined) {
      hasChangeEnv = state.hasMenuApp !== newEnv;
    }

    if (hasChangeEnv) {
      modifier.menuAppTokens = {};
    } else if (action.payload.menuAppTokens) {
      modifier.menuAppTokens = {
        ...state.menuAppTokens,
        ...action.payload.menuAppTokens
      };
    }

    return {
      ...state,
      ...action.payload,
      ...modifier
    };
  }
});
