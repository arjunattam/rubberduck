// Github blob (file view) view handler
// Exports a hover listener method with a callback param
// Callback gets object: filePath, fileSha, lineNumber, charNumber, name
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

const parseCommonAncestor = (element, x, y) => {
  const node = element.parentNode;
  // TODO(arjun): need to remove this dependency of get repo path
  const { typeId } = getRepoFromPath(); // sha id from window url
  const result = {
    name: element.nodeValue,
    filePath: getFileUri(node, typeId),
    fileSha: typeId,
    lineNumber: getLineNumber(node),
    charNumber: getCharNumber(node, x),
    mouseX: x,
    mouseY: y
  };

  if (isValidResult(result)) {
    return result;
  } else {
    return {};
  }
};

const stripPx = value => {
  // Get `12px` and return `12`
  return +value.replace("px", "");
};

export const readXY = (mouseX, mouseY) => {
  const range = document.caretRangeFromPoint(mouseX, mouseY);
  const rangeElement = range.commonAncestorContainer;
  return parseCommonAncestor(rangeElement, mouseX, mouseY);
};

export const listener = (event, callback) => {
  const result = readXY(event.x, event.y);
  callback(result);
};
