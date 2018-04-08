import { getGitService } from "../../adapters";

const delimiterChars = "'.:\\\"$+<=>^` \\t,\\(\\)\\{\\}\\[\\]";

var observer;

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
      console.log(splitText);
      const spannedChild = splitText.map(
        text => (text.length > 0 ? `<span>${text}</span>` : text)
      );
      reconstructedElements.push(...spannedChild);
    } else {
      reconstructedElements.push(childNode.outerHTML);
    }
  });
  codeTd.innerHTML = reconstructedElements.join("");
};

export const fillUpSpans = () => {
  let codeTds;

  switch (getGitService()) {
    case "github":
      codeTds = document.querySelectorAll("td.blob-code-inner");
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

export const setupObserver = () => {
  // TODO(arjun): gets triggered twice on github
  var targetNode = document.querySelector(getCodeParentSelector());
  var config = { childList: true, subtree: true };
  var callback = function(mutationsList) {
    fillUpSpans();
  };
  observer = new MutationObserver(callback);
  if (targetNode) {
    observer.observe(targetNode, config);
    fillUpSpans();
  }
};
