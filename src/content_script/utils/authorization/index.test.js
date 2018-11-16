jest.mock("../storage");

import { AuthStore } from "./index";
import configureStore from "redux-mock-store";
import { setInSyncStore, setInLocalStore } from "../storage";
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

test("get token for menu app works", () => {
  const store = mockStore({
    storage: { token: "test-token", menuAppTokens: { token: "this-one" } }
  });
  const Authorization = new AuthStore(store);
  Authorization.isOnMenuAppEnv = true;
  expect(Authorization.getToken()).toEqual("this-one");
});

test("get client id for menu app works", () => {
  const store = mockStore({
    storage: { menuAppTokens: { clientId: "this-one" } }
  });
  const Authorization = new AuthStore(store);
  Authorization.isOnMenuAppEnv = true;
  expect(Authorization.getClientId()).toEqual("this-one");
});

test("get base url works", () => {
  const store = mockStore({ storage: { hasMenuApp: false } });
  const Authorization = new AuthStore(store);
  const expected = "https://www.codeview.io/";
  expect(Authorization.getBaseUrl()).toEqual(expected);
});

test("get base url for menu app works", () => {
  let store = mockStore({ storage: { defaultPort: 7881 } });
  const Authorization = new AuthStore(store);
  Authorization.isOnMenuAppEnv = true;
  const expected = "http://localhost:7881/";
  expect(Authorization.getBaseUrl()).toEqual(expected);
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

test("test token saved in local store", () => {
  let store = mockStore({});
  const Authorization = new AuthStore(store);
  Authorization.isOnMenuAppEnv = true;
  Authorization.updateTokenStorage({ token: "new-token" });
  expect(setInLocalStore.mock.calls.length).toEqual(1);
  expect(setInLocalStore).lastCalledWith(
    {
      menuAppTokens: { token: "new-token" }
    },
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
