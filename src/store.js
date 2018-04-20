import { createStore, combineReducers, applyMiddleware } from "redux";
import dataReducer from "./reducers/dataReducer";
import storage from "./reducers/storageReducer";
import thunk from "redux-thunk";
import promise from "redux-promise-middleware";

export default createStore(
  combineReducers({
    data: dataReducer,
    storage
  }),
  {},
  applyMiddleware(thunk, promise())
);
