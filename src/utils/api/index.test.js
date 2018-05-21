import { API } from "./index";
import mockAxios from "jest-mock-axios";

const EXAMPLE_PR_FILES_RESPONSE = [
  {
    sha: "bbcd538c8e72b8c175046e27cc8f907076331401",
    filename: "file1.txt",
    status: "added",
    additions: 103,
    deletions: 21,
    changes: 124,
    patch: "@@ -132,7 +132,7 @@ module Test @@ -1000,7 +1000,7 @@ module Test"
  }
];

const EXAMPLE_PR_FILES_RESPONSE_2 = [
  {
    sha: "bbcd538c8e72b8c175046e27cc8f907076331401",
    filename: "dir/file2.txt",
    status: "added",
    additions: 103,
    deletions: 21,
    changes: 124,
    patch: "@@ -132,7 +132,7 @@ module Test @@ -1000,7 +1000,7 @@ module Test"
  }
];

const LINK_HEADERS =
  '<https://api.github.com/repositories/50594260/pulls/824/files?page=2>; rel="next", <https://api.github.com/repositories/50594260/pulls/824/files?page=5>; rel="last"';

afterEach(() => {
  mockAxios.reset();
});

test("pr files api calls correct url", () => {
  const repoDetails = {
    type: "pull",
    reponame: "test-repo",
    username: "test-org",
    prId: 824,
    isPrivate: false
  };
  API.getTree(repoDetails);
  const EXPECTED_URL =
    "https://api.github.com/repos/test-org/test-repo/pulls/824/files";
  expect(mockAxios.get).toHaveBeenCalled();
  expect(mockAxios.lastReqGet().url).toEqual(EXPECTED_URL);
});

test("pr files api generates correct response", () => {
  const repoDetails = {
    type: "pull",
    reponame: "test-repo",
    username: "test-org",
    prId: 824,
    isPrivate: false
  };
  const promise = API.getTree(repoDetails);
  mockAxios.mockResponse({
    data: EXAMPLE_PR_FILES_RESPONSE
  });
  expect(promise).resolves.toEqual(EXAMPLE_PR_FILES_RESPONSE);
});

test("pr files api works with pagination", () => {
  const repoDetails = {
    type: "pull",
    reponame: "test-repo",
    username: "test-org",
    prId: 824,
    isPrivate: false
  };
  const promise = API.getTree(repoDetails);
  mockAxios.mockResponse({
    data: EXAMPLE_PR_FILES_RESPONSE,
    headers: { Link: LINK_HEADERS }
  });
  expect(promise).resolves.toEqual(EXAMPLE_PR_FILES_RESPONSE);
});
