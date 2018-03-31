import BaseViewListener from "../../base/views";

class BaseBitbucketListener extends BaseViewListener {}

class PRPageListener extends BaseBitbucketListener {
  isValidResult = (element, x, y, hoverResult) => {
    return this.valuesAreValid(hoverResult);
  };

  getFileUri = element => {
    try {
      const fileContentDiv = element.parentNode.closest("div.diff-container");
      const sectionDiv = fileContentDiv.parentNode;
      return sectionDiv.getAttribute("data-path");
    } catch (err) {
      return -1;
    }
  };

  getFileSha = element => {
    try {
      const lineDiv = element.parentNode.closest("div.udiff-line");
      return lineDiv.classList.contains("deletion") ? "base" : "head";
    } catch (err) {
      return -1;
    }
  };

  getLineNumber = element => {
    try {
      const lineDiv = element.parentNode.closest("div.udiff-line");
      const gutterDiv = lineDiv.querySelector("div.gutter");
      const lineId = gutterDiv.id; // example: Lpybitbucket/auth.pyT58
      const matched = lineId.match(/^(L.+)\/(.+)[TF]([0-9]+)$/);
      return +matched[3] - 1; // for 0-indexed
    } catch (err) {
      return -1;
    }
  };

  getCharNumber = (element, mouseX, mouseY) => {
    try {
      const lineDiv = element.parentNode.closest("pre.source");
      const bbox = lineDiv.getBoundingClientRect();
      const charInPixels = mouseX - bbox.x - this.getPaddingLeft(lineDiv);
      const fontSize = this.getFontSize(lineDiv);
      const estimatedChars = this.getCharsFromPixels(charInPixels, fontSize);
      const tabSize = this.getTabSize(lineDiv);
      const numTabs = this.getNumTabs(lineDiv);
      return Math.round(estimatedChars - numTabs * (tabSize - 1)) - 1; // PR adds +/-
    } catch (err) {
      return -1;
    }
  };

  getBoundRect = (element, mouseX, mouseY) => {
    const rect = element.parentElement.getBoundingClientRect();
    const PADDING = 50;
    let copyRect = Object.assign({}, rect);
    copyRect.left = mouseX - PADDING;
    return copyRect;
  };
}

export const listener = (event, callback) => {
  const pageListener = new PRPageListener();
  const result = pageListener.readXY(event.x, event.y);
  callback(result);
};

export const readXY = (x, y, fileSha) => {
  const pageListener = new PRPageListener();
  return pageListener.readXY(x, y);
};
