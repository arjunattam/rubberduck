import { getGitService, isGithubCompareView } from "../index";

var observer;

const delimiterChars = "'.:\\\"$+<=>^` \\t,\\(\\)\\{\\}\\[\\]";

const delimiterSplit = string => {
  // This method splits the string with the delimiters
  // but also returns the delimiters as array elements in the output

  // Example input: from django.conf import settings
  const splitter = new RegExp(`(?=[${delimiterChars}])`);
  const lookaheadSplit = string.split(splitter);
  // Now: ["from", " django", ".conf", " import", " settings"]
  let finalSplit = [];
  lookaheadSplit.forEach(element => {
    const matcher = new RegExp(`([${delimiterChars}])+(.*)`);
    const match = element.match(matcher);
    if (match) {
      finalSplit.push(match[1], match[2]);
    } else {
      // No match was found
      finalSplit.push(element);
    }
  });

  // Final output: ["from", " ", "django", ".", "conf", " ", "import", " ", "settings"]
  return finalSplit;
};

const reconstructTd = codeTd => {
  const childNodes = codeTd.childNodes;
  let reconstructedElements = [];
  childNodes.forEach(childNode => {
    if (childNode.nodeType === 3) {
      // This is a text child node
      const childText = childNode.nodeValue;
      const splitText = delimiterSplit(childText);
      const spannedChild = splitText.map(text => {
        const delimiterMatcher = new RegExp(`[${delimiterChars}]`);
        if (text.match(delimiterMatcher) || text.length < 1) {
          return text;
        } else {
          return `<span>${text}</span>`;
        }
      });
      reconstructedElements.push(...spannedChild);
    } else {
      reconstructedElements.push(childNode.outerHTML);
    }
  });
  codeTd.innerHTML = reconstructedElements.join("");
};

const fillUpSpans = () => {
  let codeTds;

  switch (getGitService()) {
    case "github":
      if (isGithubCompareView()) {
        codeTds = document.querySelectorAll("span.blob-code-inner");
      } else {
        codeTds = document.querySelectorAll("td.blob-code-inner");
      }
      break;
    case "bitbucket":
      codeTds = document.querySelectorAll("div.udiff-line pre");
      break;
    default:
      codeTds = [];
  }

  if (codeTds.length > 0) {
    observer.disconnect(); // disconnect the MutationObserver
    codeTds.forEach(codeTd => reconstructTd(codeTd));
    setupMutationObserver();
  }
};

const getCodeParentSelector = () => {
  switch (getGitService()) {
    case "github":
      return "div.repository-content";
    case "bitbucket":
      return "div#pr-tab-content";
    default:
      return null;
  }
};

const setupMutationObserver = () => {
  var targetNode = document.querySelector(getCodeParentSelector());
  var config = { childList: true, subtree: true };
  var callback = function(mutationsList) {
    fillUpSpans();
  };
  observer = new MutationObserver(callback);
  if (targetNode) {
    observer.observe(targetNode, config);
  }
};

export const setupObserver = () => {
  setupMutationObserver();
  fillUpSpans();
};
