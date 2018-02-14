import { createStore, combineReducers, applyMiddleware } from "redux";
import auth from "./reducers/authReducer.js";

export default createStore(
  combineReducers({
    auth
  }),
  {}
);
