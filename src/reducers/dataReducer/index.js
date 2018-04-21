import { createReducer } from "redux-create-reducer";
import { combineReducers } from "redux";
import section from "./section";
import repoDetails from "./repoDetails";
import fileTree from "./fileTree";
import hoverResult from "./hoverResult";
import session from "./session";

const initialState = {
  // Triggers the 401 pop-up
  isUnauthenticated: false
};

const data = createReducer(initialState, {
  UPDATE_DATA: (state, action) => {
    return {
      ...state,
      ...action.payload
    };
  }
});

const dataReducer = combineReducers({
  data,
  fileTree,
  repoDetails,
  section,
  hoverResult,
  session
});

export default dataReducer;
