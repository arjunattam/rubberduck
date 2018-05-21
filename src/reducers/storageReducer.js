import { createReducer } from "redux-create-reducer";

const initialState = {
  initialized: false,
  clientId: null,
  token: null,

  // Sidebar props
  isSidebarVisible: true,
  sidebarWidth: 235,

  // Settings --> TODO(arjun): move these to chrome.storage.local (not sync)
  hasHoverDebug: false,
  hasMenuBarApp: false,
  defaultPort: 8000,

  // API response caching: hash of url is the object key
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
    let sanitizedPayload = action.payload;
    return {
      ...state,
      ...sanitizedPayload
    };
  }
});
