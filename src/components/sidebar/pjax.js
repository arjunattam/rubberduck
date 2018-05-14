import { getGitService } from "../../adapters";

const Pjax = require("pjax");
let GlobalPjax;

const FILES_TREE_SELECTOR = "#mercury-sidebar .tree-container .tree-content";

const LINK_SELECTOR = "#mercury-sidebar a";

/**
 * returns pjax selector for git remote service
 */
const getPjaxSelector = () => {
  const service = getGitService();
  if (service === "github") {
    return ["#js-repo-pjax-container"];
  } else if (service === "bitbucket") {
    return ["#source-container"];
  }
};

/**
 * sets up pjax, only on elements of the sidebar (this is important!)
 */
const createPjax = () => {
  GlobalPjax = new Pjax({
    elements: LINK_SELECTOR,
    selectors: ["title", ...getPjaxSelector()],
    disablePjaxHeader: true,
    cacheBust: false,
    currentUrlFullReload: false
  });
};

/**
 * pjax needs to be reset whenever there is a mutation on the
 * files tree DOM element.
 */
const setupPjaxHelper = () => {
  console.log("setup pjax helper");
  var targetNode = document.querySelector(FILES_TREE_SELECTOR);
  var config = { childList: true, subtree: true };
  var callback = function(mutationsList) {
    // TODO(arjun): remove console logs
    console.log("mutations", mutationsList);
    createPjax();
  };
  var observer = new MutationObserver(callback);

  if (targetNode) {
    observer.observe(targetNode, config);
    createPjax(); // first time setup
  }
};

/**
 * TODO(arjun): add callback to the loadUrl method, so that we can
 * use it for highlighted the line on `Open file`
 */
export const loadUrl = path => GlobalPjax.loadUrl(path);

/**
 * waits for a second so that the page loads, and then sets up pjax
 */
export const setupPjax = () => {
  setTimeout(() => {
    setupPjaxHelper();
  }, 1000);
};
