const getFileUri = element => {
  // file uri is the attribute `data-path` of div.js-file-header
  // which is the left sibling of div.js-file-content, which is
  // an ancestor of given element.
  try {
    const fileContentDiv = element.parentNode.closest("div.js-file-content");
    const divSiblings = fileContentDiv.parentNode;
    const fileHeaderDiv = divSiblings.querySelectorAll("div.js-file-header")[0];
    return fileHeaderDiv.getAttribute("data-path");
  } catch (err) {
    return -1;
  }
};

const getLineNumber = element => {
  // line number is attribute `data-line-number` of td.blob-num
  // which is the left sibling of td.code-review, which is ancestor of element
  // In case when the code was not in view, and was brought by "expanding", we
  // need to look for a different parent, td.blob-code
  let codeTd = element.parentNode.closest("td.code-review");

  if (codeTd === null) {
    codeTd = element.parentNode.closest("td.blob-code");
  }

  try {
    let lineTd = codeTd.previousSibling.previousSibling;

    if (lineTd.getAttribute("data-line-number") === null) {
      // In unified diff view, we need to go more left to find siblings
      lineTd = lineTd.previousSibling.previousSibling;
    }

    return +lineTd.getAttribute("data-line-number") - 1; // 0-indexed
  } catch (err) {
    return -1;
  }
};

const getCharNumber = (element, mouseX) => {
  // Similar to blob calculation
  let codeTd = element.parentNode.closest("td.code-review");

  if (codeTd === null) {
    codeTd = element.parentNode.closest("td.blob-code");
  }

  try {
    const bbox = codeTd.getBoundingClientRect();
    const elStyle = window.getComputedStyle(codeTd);
    const charInPixels = mouseX - bbox.x - stripPx(elStyle.paddingLeft);
    const lineHeight = stripPx(elStyle.fontSize);
    const fontAspectRatio = 0.6; // aspect ratio (w/h) for SF-Mono font
    return Math.round(charInPixels / (fontAspectRatio * lineHeight)) - 1; // PR adds +/-
  } catch (err) {
    return -1;
  }
};

const parseCommonAncestor = (element, x, y, callback) => {
  callback({
    elementText: element.nodeValue,
    filePath: getFileUri(element),
    // fileSha: typeId,
    lineNumber: getLineNumber(element),
    charNumber: getCharNumber(element, x)
  });
};

const stripPx = value => {
  // Get `12px` and return `12`
  return +value.replace("px", "");
};

export const listener = (event, callback) => {
  const range = document.caretRangeFromPoint(event.x, event.y);
  const rangeElement = range.commonAncestorContainer;
  parseCommonAncestor(rangeElement, event.x, event.y, callback);
};
