// Github blob (file view) view handler
// Exports a hover listener method with a callback param
// Callback gets object: filePath, fileSha, lineNumber, charNumber, elementText

const getFileUri = node => {
  const uri = node.baseURI;
  // TODO(arjun): replace master with sha
  const parsed = uri.replace("#", "").split("master");
  return parsed[1].slice(1);
};

const getLineNumber = node => {
  const nodeId = node.id;
  const parentNodeId = node.parentNode.id;
  // One of these two needs to look like LC12
  if (nodeId.indexOf("LC") >= 0) {
    return +nodeId.replace("LC", "") - 1; // for 0-indexed
  } else if (parentNodeId.indexOf("LC") >= 0) {
    return +parentNodeId.replace("LC", "") - 1; // for 0-indexed
  } else {
    return -1;
  }
};

const getCharNumber = (node, mouseX) => {
  let element = node;
  if (node.id.indexOf("LC") < 0) {
    // node or parentNode is the relevant `td` element we need
    if (node.parentNode.id.indexOf("LC") >= 0) {
      element = node.parentNode;
    } else {
      return -1;
    }
  }

  const bbox = element.getBoundingClientRect();
  const elStyle = window.getComputedStyle(element);
  const charInPixels = mouseX - bbox.x - stripPx(elStyle.paddingLeft);
  const lineHeight = stripPx(elStyle.fontSize);
  const fontAspectRatio = 0.6; // aspect ratio (w/h) for SF-Mono font
  return Math.round(charInPixels / (fontAspectRatio * lineHeight));
};

const parseCommonAncestor = (element, x, y, callback) => {
  const node = element.parentNode;
  callback({
    elementText: element.nodeValue,
    filePath: getFileUri(node),
    fileSha: "master", // TODO(arjun): fix sha
    lineNumber: getLineNumber(node), // TODO(arjun): handle -1
    charNumber: getCharNumber(node, x)
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
