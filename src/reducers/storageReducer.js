import { createReducer } from "redux-create-reducer";

const initialState = {
  initialized: false,
  clientId: null,
  token: null,

  // Sidebar props
  isSidebarVisible: true,
  sidebarWidth: 235,

  // Hover debug
  hasHoverDebug: false,

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
    console.log("Updated storage data from chrome", {
      ...state,
      ...action.payload
    });
    let sanitizedPayload = action.payload;
    return {
      ...state,
      ...sanitizedPayload
    };
  }
});
