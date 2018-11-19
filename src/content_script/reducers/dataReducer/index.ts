import { createReducer } from "redux-create-reducer";
import { combineReducers } from "redux";
import section from "./section";
import { repoDetails, view } from "./repoDetails";
import fileTree from "./fileTree";
import definition from "./definition";
import usages from "./usages";
import hoverResult from "./hoverResult";
import session from "./session";
import fileContents from "./fileContents";
import pjax from "./pjax";

const initialState = {};

const data = createReducer(initialState, {
  UPDATE_DATA: (state, action: any) => ({
    ...state,
    ...action.payload
  })
});

const dataReducer = combineReducers({
  data,
  repoDetails, // old repo details (for backward compatibility)
  view, // new repo details
  section,
  session,
  fileTree,
  definition,
  usages,
  hoverResult,
  fileContents,
  pjax
});

export default dataReducer;
