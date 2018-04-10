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

const constructNodeHTML = childText => {
  // const childText = node.nodeValue;
  const splitText = delimiterSplit(childText);
  const spannedChild = splitText.map(text => {
    const delimiterMatcher = new RegExp(`[${delimiterChars}]`);
    if (text.match(delimiterMatcher) || text.length < 1) {
      return text;
    } else {
      return `<span>${text}</span>`;
    }
  });
  return spannedChild;
};

const isDarkDiffElement = node => {
  switch (getGitService()) {
    case "github":
      return node.classList.contains("x") && node.tagName === "SPAN";
    case "bitbucket":
      return node.tagName === "DEL" || node.tagName === "INS";
    default:
      return false;
  }
};

const reconstructTd = codeTd => {
  const childNodes = codeTd.childNodes;
  let reconstructedElements = [];
  childNodes.forEach(childNode => {
    if (childNode.nodeType === 3 && childNode.nodeValue) {
      // This is a text child node
      const spannedChild = constructNodeHTML(childNode.nodeValue);
      reconstructedElements.push(...spannedChild);
    } else if (isDarkDiffElement(childNode)) {
      // To fix the cases where `darker diff colors` break span-fill,
      // we will check if this span element's nodeValue contains delimiters
      const childText = childNode.textContent;
      const splitText = delimiterSplit(childText);

      if (splitText.length > 1) {
        // This has delimiters, we need to split the inner elements
        const newInnerHTML = constructNodeHTML(childText);
        childNode.innerHTML = newInnerHTML.join("");
        reconstructedElements.push(childNode.outerHTML);
      } else {
        reconstructedElements.push(childNode.outerHTML);
      }
    } else {
      reconstructedElements.push(childNode.outerHTML);
    }
  });
  codeTd.innerHTML = reconstructedElements.join("");
};

export const fillUpSpans = rootElement => {
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
  codeboxElements.forEach(element => {
    element.onmouseover = null;
    element.onmouseover = e => {
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
