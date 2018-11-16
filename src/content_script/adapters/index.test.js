import { isGithubCompareView } from "./index";

const setURL = url => {
  const parser = document.createElement("a");
  parser.href = url;
  [
    "href",
    "protocol",
    "host",
    "hostname",
    "origin",
    "port",
    "pathname",
    "search",
    "hash"
  ].forEach(prop => {
    Object.defineProperty(window.location, prop, {
      value: parser[prop],
      writable: true
    });
  });
};

test("compare view is detected", () => {
  setURL("https://github.com/facebook/jest/pull/890");
  expect(isGithubCompareView()).toEqual(true);

  setURL("https://github.com/facebook/jest/pulls");
  expect(isGithubCompareView()).toEqual(false);

  setURL("https://github.com/facebook/jest/commit/abcde");
  expect(isGithubCompareView()).toEqual(true);

  setURL("https://github.com/facebook/jest/compare/develop...master");
  expect(isGithubCompareView()).toEqual(true);

  setURL("https://github.com/facebook/jest");
  expect(isGithubCompareView()).toEqual(false);
});
