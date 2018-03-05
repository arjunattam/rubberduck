// Github blob (file view) view handler
// Exports a hover listener method with a callback param
// Callback gets object: filePath, fileSha, lineNumber, charNumber, name
import BaseListener from "./base";
import { getRepoFromPath } from "../path";

class BlobPageListener extends BaseListener {
  getFileSha = element => {
    // TODO -- this might fail for cases where branch name has a `/`
    const { typeId } = getRepoFromPath(); // sha id from window url
    return typeId;
  };

  getCharNumber = (element, mouseX) => {
    const node = element.parentNode;
    let actualElement = node;
    if (node.id.indexOf("LC") < 0) {
      // node or parentNode is the relevant `td` element we need
      if (node.parentNode.id.indexOf("LC") >= 0) {
        actualElement = node.parentNode;
      } else {
        return -1;
      }
    }
    const bbox = actualElement.getBoundingClientRect();
    const elStyle = window.getComputedStyle(actualElement);
    const charInPixels = mouseX - bbox.x - this.stripPx(elStyle.paddingLeft);
    const lineHeight = this.stripPx(elStyle.fontSize);
    const fontAspectRatio = this.getFontAspectRatio(); // aspect ratio (w/h) for SF-Mono font
    return Math.round(charInPixels / (fontAspectRatio * lineHeight));
  };

  getLineNumber = element => {
    const node = element.parentNode;
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

  getFileUri = element => {
    const node = element.parentNode;
    const shaId = this.getFileSha();
    const uri = node.baseURI;
    const parsed = uri.replace("#", "").split(shaId);
    return parsed[1].slice(1);
  };
}

export const listener = (event, callback) => {
  const pageListener = new BlobPageListener();
  const result = pageListener.readXY(event.x, event.y);
  callback(result);
};
