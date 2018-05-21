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
  '<https://api.github.com/repositories/134233736/pulls/824/files?page=2>; rel="next", <https://api.github.com/repositories/134233736/pulls/824/files?page=5>; rel="last"';

const REPO_DETAILS = {
  type: "pull",
  reponame: "test-repo",
  username: "test-org",
  prId: 824,
  isPrivate: false
};

afterEach(() => {
  mockAxios.reset();
});

test("pr files api calls correct url", () => {
  API.getTree(REPO_DETAILS);
  const EXPECTED_URL =
    "https://api.github.com/repos/test-org/test-repo/pulls/824/files";
  expect(mockAxios.get).toHaveBeenCalled();
  expect(mockAxios.lastReqGet().url).toEqual(EXPECTED_URL);
});

test("pr files api generates correct response", () => {
  const promise = API.getTree(REPO_DETAILS);
  mockAxios.mockResponse({
    data: EXAMPLE_PR_FILES_RESPONSE
  });
  expect(promise).resolves.toEqual({ data: EXAMPLE_PR_FILES_RESPONSE });
});

test("pr files api works with link headers", () => {
  const promise = API.getTree(REPO_DETAILS);
  mockAxios.mockResponse({
    data: EXAMPLE_PR_FILES_RESPONSE,
    headers: { link: LINK_HEADERS }
  });
  const response = {
    data: EXAMPLE_PR_FILES_RESPONSE,
    nextPage: 2,
    lastPage: 5
  };
  expect(promise).resolves.toEqual(response);
});
