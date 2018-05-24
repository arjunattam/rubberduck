import { AuthStore } from "./index";
import configureStore from "redux-mock-store";
const JWT = require("jsonwebtoken");

const middlewares = [];
const mockStore = configureStore(middlewares);

test("get token works", () => {
  const store = mockStore({ storage: { token: "test-token" } });
  const Authorization = new AuthStore(store);
  expect(Authorization.getToken()).toEqual("test-token");
});

test("get base url works", () => {
  const store = mockStore({ storage: { hasMenuApp: false } });
  const Authorization = new AuthStore(store);
  const expected = "https://www.codeview.io/";
  expect(Authorization.getBaseUrl()).toEqual(expected);
});

test("get base url for menu app works", () => {
  const store = mockStore({ storage: { hasMenuApp: false } });
  const Authorization = new AuthStore(store);
  const expected = "https://www.codeview.io/";
  expect(Authorization.getBaseUrl()).toEqual(expected);
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

test("test auth has changed works for token", () => {
  const Authorization = new AuthStore(mockStore({}));
  const prevStorage = { token: "token-a", hasMenuApp: true };
  const newStorage = { token: "token-b", hasMenuApp: true };
  expect(Authorization.hasChanged(prevStorage, newStorage)).toEqual(true);
});

test("test auth has changed works for env", () => {
  const Authorization = new AuthStore(mockStore({}));
  const prevStorage = { token: "test", hasMenuApp: true };
  const newStorage = { token: "test", hasMenuApp: false };
  expect(Authorization.hasChanged(prevStorage, newStorage)).toEqual(true);
});
