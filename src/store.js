import { createStore, combineReducers, applyMiddleware } from "redux";
import data from "./reducers/dataReducer";
import storage from "./reducers/storageReducer";
import thunk from "redux-thunk";
import promise from "redux-promise-middleware";

export default createStore(
  combineReducers({
    data,
    storage
  }),
  {},
  applyMiddleware(thunk, promise())
);
