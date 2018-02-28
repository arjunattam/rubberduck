import { createReducer } from "redux-create-reducer";

const initialState = {
  initialized: false,
  clientId: null,
  token: null,
  sessions: {}
};

const sanitizeChromeStoratePayload = payload => {
  let sanitizedPayload = { ...payload };
  for (let key in payload) {
    if (sanitizedPayload[key]) continue;
    switch (key) {
      case "sessions":
        sanitizedPayload[key] = {};
        break;
    }
  }
  return sanitizedPayload;
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
    let sanitizedPayload = sanitizeChromeStoratePayload(action.payload);
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
