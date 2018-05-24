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

    if (state.hasMenuApp !== action.payload.hasMenuApp) {
      // Refresh the menu app tokens
      modifier.menuAppTokens = {};
    }

    if (action.payload.menuAppTokens) {
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
