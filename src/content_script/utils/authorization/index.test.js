jest.mock("../storage");

import { AuthStore } from "./index";
import configureStore from "redux-mock-store";
import { setInSyncStore } from "../storage";
const JWT = require("jsonwebtoken");

const middlewares = [];
const mockStore = configureStore(middlewares);

afterEach(() => {
  jest.resetAllMocks();
});

test("get token works", () => {
  const store = mockStore({ storage: { token: "test-token" } });
  const Authorization = new AuthStore(store);
  expect(Authorization.getToken()).toEqual("test-token");
});

test("test token saved in sync store", () => {
  let store = mockStore({});
  const Authorization = new AuthStore(store);
  Authorization.updateTokenStorage({ token: "token", clientId: "id" });
  expect(setInSyncStore.mock.calls.length).toEqual(1);
  expect(setInSyncStore).lastCalledWith(
    { token: "token", clientId: "id" },
    expect.any(Function)
  );
});

test("get auth state for logged in works", () => {
  const payload = {
    github_username: "bar"
  };
  const options = {
    expiresIn: "1h"
  };
  const authenticatedToken = JWT.sign(payload, "key", options);
  const Authorization = new AuthStore(
    mockStore({ storage: { token: authenticatedToken } })
  );
  expect(Authorization.getAuthState()).toEqual("has_authenticated");
});

test("get auth state for unauth works", () => {
  const options = {
    expiresIn: "1h"
  };
  const unauthToken = JWT.sign({}, "key", options);
  const Authorization = new AuthStore(
    mockStore({ storage: { token: unauthToken } })
  );
  expect(Authorization.getAuthState()).toEqual("has_token");
});
