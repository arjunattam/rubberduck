import { createReducer } from "redux-create-reducer";

const initialState = {
  initialized: false,
  clientId: null,
  token: null,

  // Sidebar visible
  isSidebarVisible: true
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
  },
  UPDATE_STORAGE: (state, action) => {
    console.log("Updated storage data locally", {
      ...state,
      ...action.payload
    });
    return {
      ...state,
      ...action.payload
    };
  }
});
