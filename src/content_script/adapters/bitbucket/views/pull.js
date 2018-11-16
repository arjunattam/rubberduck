import BaseViewListener from "../../base/views";

class PRPageListener extends BaseViewListener {
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
      return lineDiv.classList.contains("addition") ? "head" : "base";
    } catch (err) {
      return -1;
    }
  };

  getLineNumber = element => {
    try {
      const lineDiv = element.parentNode.closest("div.udiff-line");
      const lineTag = lineDiv.querySelector("a.line-numbers");
      // Attribute data-fnum has base line number and data-tnum has head number
      const headLine = lineTag.getAttribute("data-tnum");
      const baseLine = lineTag.getAttribute("data-fnum");
      const whichLine = baseLine || headLine; // Base is first because of sha choice
      return +whichLine - 1; // for 0-indexed
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
}

export const listener = (event, callback) => {
  const pageListener = new PRPageListener();
  const result = pageListener.readXY(event.x, event.y);
  callback(result);
};
