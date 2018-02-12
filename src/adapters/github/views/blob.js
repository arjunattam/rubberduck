// Github blob (file view) view handler
// Exports a hover listener method with a callback param
// Callback gets object: filePath, fileSha, lineNumber, charNumber, elementText
import { getRepoFromPath } from "../path";

const getFileUri = (node, shaId) => {
  const uri = node.baseURI;
  const parsed = uri.replace("#", "").split(shaId);
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

const isValidResult = result => {
  return !Object.keys(result).some(function(k) {
    return result[k] === -1;
  });
};

const parseCommonAncestor = (element, x, y, callback) => {
  const node = element.parentNode;
  const { typeId } = getRepoFromPath(); // sha id from window url
  const result = {
    elementText: element.nodeValue,
    filePath: getFileUri(node, typeId),
    fileSha: typeId,
    lineNumber: getLineNumber(node),
    charNumber: getCharNumber(node, x),
    mouseX: x,
    mouseY: y
  };

  if (isValidResult(result)) {
    callback(result);
  } else {
    // To make the hover box disappear from the view :(
    callback({
      mouseX: -1000,
      mouseY: -1000
    });
  }
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
