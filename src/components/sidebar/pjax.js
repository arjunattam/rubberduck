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
 * Pjax has an odd behaviour where it attaches to the links on the
 * GitHub pages, even outside the definition scope. Hence we feed it
 * with a weird random selector that matches nothing (hopefully!)
 */
const getRandomSelector = () => {
  return ".db18458e2782b2b77e36769c569e263a53885a9944dd0a861e5064eac16f1a a";
};

/**
 * Only supports GitHub
 *
 * See docs/PJAX.md for manual test-cases.
 */
export const loadUrl = (path, callback) => {
  const containerSelector = getPjaxSelector();
  const startTimestamp = +new Date();

  // Add a once only event listener
  document.addEventListener(
    "pjax:complete",
    () => {
      const { state, title, url } = constructState(path, startTimestamp);
      window.history.pushState(state, title, url);
      callback();
    },
    { once: true }
  );

  const newPjax = new Pjax({
    selectors: ["title", containerSelector],
    elements: getRandomSelector(),
    disablePjaxHeader: true,
    cacheBust: false,
    history: false
  });
  newPjax.loadUrl(path);
};
