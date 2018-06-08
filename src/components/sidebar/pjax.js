import { getGitService } from "../../adapters";
const Pjax = require("pjax");

/**
 * returns pjax selector for git remote service
 */
const getPjaxSelector = () => {
  const service = getGitService();
  if (service === "github") {
    return "#js-repo-pjax-container";
  } else if (service === "bitbucket") {
    return "#source-container";
  }
};

/**
 * Construct the same state that GitHub uses. To see GitHub's state
 * run `window.history.state` in browser console.
 */
const constructState = (path, startTimestamp) => {
  const title = document.title;
  const url = `https://github.com${path}`;
  const state = {
    container: getPjaxSelector(),
    id: +new Date(),
    timeout: 650,
    title,
    url,
    _id: startTimestamp
  };
  return { state, title, url };
};

/**
 * Only supports GitHub
 *
 * See docs/PJAX.md for manual test-cases.
 */
export const loadUrl = (path, callback) => {
  const containerSelector = getPjaxSelector();
  console.log("calling load url", path);
  const startTimestamp = +new Date();

  // Add a once only event listener
  document.addEventListener(
    "pjax:complete",
    () => {
      console.log("pjax completed for ", path);
      const { state, title, url } = constructState(path, startTimestamp);
      window.history.pushState(state, title, url);
      callback();
    },
    { once: true }
  );

  const newPjax = new Pjax({
    selectors: ["title", containerSelector],
    disablePjaxHeader: true,
    cacheBust: false,
    history: false
  });
  newPjax.loadUrl(path);
};
