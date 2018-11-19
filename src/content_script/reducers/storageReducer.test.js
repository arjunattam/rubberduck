import storage from "./storageReducer";
import { Reducer } from "redux-testkit";

const initialState = {};

test("setting from storage intializes", () => {
  const action = { type: "SET_FROM_CHROME_STORAGE", payload: {} };
  Reducer(storage)
    .withState(initialState)
    .expect(action)
    .toReturnState({ initialized: true });
});

test("updating from storage works", () => {
  const payload = { test: false };
  const action = {
    type: "UPDATE_FROM_CHROME_STORAGE",
    payload
  };
  Reducer(storage)
    .withState(initialState)
    .expect(action)
    .toReturnState(payload);
});
