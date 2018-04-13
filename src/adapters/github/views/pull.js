import BaseGithubListener from "./base";

class PRPageListener extends BaseGithubListener {
  getFileUri = element => {
    // file uri is the attribute `data-path` of div.js-file-header
    // which is the left sibling of div.js-file-content, which is
    // an ancestor of given element.
    try {
      const fileContentDiv = element.parentNode.closest("div.js-file-content");
      const divSiblings = fileContentDiv.parentNode;
      const fileHeaderDiv = divSiblings.querySelectorAll(
        "div.js-file-header"
      )[0];
      return fileHeaderDiv.getAttribute("data-path");
    } catch (err) {
      return -1;
    }
  };

  getLineNumber = element => {
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

  getCharNumberHelper = (element, mouseX) => {
    const bbox = element.getBoundingClientRect();
    const lineHeight = this.getFontSize(element);
    const charInPixels = mouseX - bbox.x - this.getPaddingLeft(element);
    const estimatedChars = this.getCharsFromPixels(charInPixels, lineHeight);
    const tabSize = this.getTabSize(element);
    const numTabs = this.getNumTabs(element);
    return Math.round(estimatedChars - numTabs * (tabSize - 1)) - 1; // PR adds +/-
  };

  getNumDisplayLines = element => {
    const boundRect = element.getBoundingClientRect();
    return Math.round(boundRect.height / this.getFontSize(element)) - 1;
  };

  getMouseDisplayLine = (element, mouseX, mouseY) => {
    const boundRect = element.getBoundingClientRect();
    const relativeY = mouseY - boundRect.y;
    return relativeY / this.getFontSize(element);
  };

  getCharNumber = (element, mouseX, mouseY) => {
    // Code lines can get extended to multiple display lines in the diff view
    // We handle cases where the code is extended to up to two display lines
    // in the diff view. Remaining cases:
    // 1. code extends to >2 display lines
    // 2. code extends to >=2 display lines in the expanded code section
    let codeTd = element.parentNode.closest("td.code-review");

    if (codeTd === null) {
      // Inside expanded code section
      codeTd = element.parentNode.closest("td.blob-code");

      if (codeTd === null) {
        return -1;
      }

      if (this.getNumDisplayLines(codeTd) > 1) {
        console.log(">=2 display lines inside expanded code is not supported");
        return -1;
      } else {
        return this.getCharNumberHelper(codeTd, mouseX);
      }
    } else {
      // Inside the diff section
      const displayLines = this.getNumDisplayLines(codeTd);

      if (displayLines === 1) {
        return this.getCharNumberHelper(codeTd, mouseX);
      } else if (displayLines === 2) {
        // We need to check where the mouse is

        if (this.getMouseDisplayLine(codeTd, mouseX, mouseY) > 1.5) {
          // We are in the second line
          const secondLineResult = this.getCharNumberHelper(codeTd, mouseX);
          const innerElement = codeTd.querySelector("span.blob-code-inner");
          // TODO(arjun): in this case, we need to strip out the tabs
          const firstLineWidth = innerElement.getBoundingClientRect().width;
          const firstLineChars =
            this.getCharsFromPixels(firstLineWidth, this.getFontSize(codeTd)) -
            1;
          // Subtracted 1 to remove the +/- that is pre-appended by github
          return secondLineResult + Math.round(firstLineChars);
        } else {
          // We are in the first line
          return this.getCharNumberHelper(codeTd, mouseX);
        }
      } else {
        console.log(">2 display lines inside diff section not supported");
        return -1;
      }
    }
  };

  getFileSha = element => {
    // Does not return the file sha, returns base/head
    // Similar to blob calculation
    let codeTd = element.parentNode.closest("td.code-review");

    if (codeTd === null) {
      codeTd = element.parentNode.closest("td.blob-code");
    }

    if (codeTd !== null) {
      if (codeTd.classList.contains("blob-code-deletion")) {
        // Deletions can only belong in base
        return "base";
      } else if (codeTd.classList.contains("blob-code-addition")) {
        // Additions can only belong in head
        return "head";
      } else {
        // This depends on the unified/split view
        const isUnifiedView = codeTd.parentNode.childNodes.length === 7;

        if (isUnifiedView) {
          // We return line number for head by convention, so this will also be head
          return "head";
        } else {
          // This is the split view
          const lineNumber = this.getLineNumber(element) + 1;
          const lineTd = codeTd.previousSibling.previousSibling;

          if (lineTd.id.indexOf("L" + lineNumber) >= 0) {
            // Left side
            return "base";
          } else if (lineTd.id.indexOf("R" + lineNumber) >= 0) {
            return "head";
          }
        }
      }
    }

    return -1;
  };
}

export const listener = (event, callback) => {
  const pageListener = new PRPageListener();
  const result = pageListener.readXY(event.x, event.y);
  callback(result);
};
