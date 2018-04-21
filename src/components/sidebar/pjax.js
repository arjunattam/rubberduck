import { getGitService } from "../../adapters";

const Pjax = require("pjax");
let GlobalPjax;

const getPjaxSelector = () => {
  const service = getGitService();
  if (service === "github") {
    return ["#js-repo-pjax-container"];
  } else if (service === "bitbucket") {
    return ["#source-container"];
  }
};

const createPjax = () => {
  // The `elements` needs to be namespaced or it shows weird
  // behaviour on Github. The PR buttons gets disabled on going from
  // repo home page --> open new PR page.
  GlobalPjax = new Pjax({
    elements: "#mercury-sidebar a", // default is "a[href], form[action]"
    selectors: ["title", ...getPjaxSelector()],
    disablePjaxHeader: true,
    cacheBust: false,
    currentUrlFullReload: false
  });
};

const setupPjaxHelper = () => {
  // Trigger pjax setup whenever the files tree DOM changes
  // Select the node that will be observed for mutations
  var targetNode = document.querySelector(".tree-container");
  // Options for the observer (which mutations to observe)
  var config = { childList: true, subtree: true };
  // Callback function to execute when mutations are observed
  var callback = function(mutationsList) {
    createPjax();
  };
  // Create an observer instance linked to the callback function
  var observer = new MutationObserver(callback);
  // Start observing the target node for configured mutations
  if (targetNode) {
    observer.observe(targetNode, config);
    createPjax();
  }
};

export const setupPjax = () => {
  // Wait for 1 seconds, and then setup pjax
  setTimeout(() => {
    setupPjaxHelper();
  }, 1000);
};
