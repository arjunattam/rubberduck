import { createStore, combineReducers, applyMiddleware } from "redux";
import auth from "./reducers/authReducer.js";
import thunk from "redux-thunk";
import promise from "redux-promise-middleware";

export default createStore(
  combineReducers({
    auth
  }),
  {},
  applyMiddleware(thunk, promise())
);
