import { getGitService, isGithubCompareView } from "../index";

const POST_FILL_CLASS = "mercury-span-filled";

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

export const fillUpSpans = rootElement => {
  console.log("fill up spans");
  let codeTds;

  switch (getGitService()) {
    case "github":
      if (isGithubCompareView()) {
        codeTds = rootElement.querySelectorAll(
          "span.blob-code-inner, td.blob-code-inner"
        );
      } else {
        codeTds = rootElement.querySelectorAll("td.blob-code-inner");
      }
      break;
    case "bitbucket":
      codeTds = rootElement.querySelectorAll("div.udiff-line pre");
      break;
    default:
      codeTds = [];
  }

  if (codeTds.length > 0) {
    codeTds.forEach(codeTd => reconstructTd(codeTd));
    rootElement.classList.add(POST_FILL_CLASS);
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

const getCodeboxSelector = () => {
  // This needs to be same as the mutation targets when
  // a non-diff view is opened (only for compare views)
  switch (getGitService()) {
    case "github":
      if (isGithubCompareView()) {
        return `table.diff-table tbody`;
      } else {
        return `div.blob-wrapper`;
      }
    case "bitbucket":
      return `div.refract-content-container`;
  }
};

const setupCodeboxListener = () => {
  const codeboxElements = document.querySelectorAll(getCodeboxSelector());
  console.log("setup codebox listener", codeboxElements.length);
  codeboxElements.forEach(element => {
    element.onmouseenter = null;
    element.onmouseenter = e => {
      if (!element.classList.contains(POST_FILL_CLASS)) fillUpSpans(element);
    };
  });
};

const removeClassNameIfRequired = mutationsList => {
  // In the case where non-diff sections are opened in a git diff view
  // we need to refill the spans. Hence we need to remove our custom
  // class name
  mutationsList.forEach(mutation => {
    const { target } = mutation;
    if (target && target.classList.contains(POST_FILL_CLASS)) {
      mutation.target.classList.remove(POST_FILL_CLASS);
    }
  });
};

const setupMutationObserver = () => {
  var targetNode = document.querySelector(getCodeParentSelector());
  var config = { childList: true, subtree: true };
  var callback = function(mutationsList) {
    removeClassNameIfRequired(mutationsList);
    setupCodeboxListener();
  };
  var observer = new MutationObserver(callback);
  if (targetNode) {
    observer.observe(targetNode, config);
    setupCodeboxListener();
  }
};

export const setupObserver = () => {
  setupMutationObserver();
};
