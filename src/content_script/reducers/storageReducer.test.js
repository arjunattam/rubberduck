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

test("update menu bar token and not client id", () => {
  const payload = { hasMenuApp: true, menuAppTokens: { token: "new-token" } };
  const action = {
    type: "UPDATE_FROM_CHROME_STORAGE",
    payload
  };
  const initial = {
    hasMenuApp: true,
    menuAppTokens: { token: "old-token", clientId: "old-id" }
  };
  Reducer(storage)
    .withState(initial)
    .expect(action)
    .toReturnState({
      hasMenuApp: true,
      menuAppTokens: {
        token: "new-token",
        clientId: "old-id"
      }
    });
});

test("update menu bar token and not client id", () => {
  const payload = { hasMenuApp: false, menuAppTokens: {} };
  const action = {
    type: "UPDATE_FROM_CHROME_STORAGE",
    payload
  };
  const initial = {
    hasMenuApp: true,
    menuAppTokens: { token: "old-token", clientId: "old-id" }
  };
  Reducer(storage)
    .withState(initial)
    .expect(action)
    .toReturnState({
      hasMenuApp: false,
      menuAppTokens: {}
    });
});

test("update with menu app tokens", () => {
  const payload = { menuAppTokens: { token: "new-token", clientId: "new-id" } };
  const action = {
    type: "UPDATE_FROM_CHROME_STORAGE",
    payload
  };
  const initial = {
    hasMenuApp: true,
    menuAppTokens: {}
  };
  Reducer(storage)
    .withState(initial)
    .expect(action)
    .toReturnState({
      hasMenuApp: true,
      menuAppTokens: { token: "new-token", clientId: "new-id" }
    });
});
