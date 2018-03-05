import BaseListener from "./base";

class PRPageListener extends BaseListener {
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

  getCharNumber = (element, mouseX) => {
    // Similar to blob calculation
    let codeTd = element.parentNode.closest("td.code-review");

    if (codeTd === null) {
      codeTd = element.parentNode.closest("td.blob-code");
    }

    try {
      const bbox = codeTd.getBoundingClientRect();
      const elStyle = window.getComputedStyle(codeTd);
      const charInPixels = mouseX - bbox.x - this.stripPx(elStyle.paddingLeft);
      const lineHeight = this.stripPx(elStyle.fontSize);
      return Math.round(this.getCharsFromPixels(charInPixels, lineHeight)) - 1; // PR adds +/-
    } catch (err) {
      return -1;
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
          } else {
            return -1;
          }
        }
      }
    } else {
      return -1;
    }
  };
}

export const listener = (event, callback) => {
  const pageListener = new PRPageListener();
  const result = pageListener.readXY(event.x, event.y);
  callback(result);
};

export const readXY = (x, y) => {
  const pageListener = new PRPageListener();
  return pageListener.readXY(x, y);
};
