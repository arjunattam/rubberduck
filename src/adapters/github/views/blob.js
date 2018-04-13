// Github blob (file view) view handler
// Exports a hover listener method with a callback param
// Callback gets object: filePath, fileSha, lineNumber, charNumber, name
import BaseGithubListener from "./base";

class BlobPageListener extends BaseGithubListener {
  constructor(fileSha) {
    super();
    this.fileSha = fileSha;
  }

  getFontAspectRatio = () => {
    return 0.6; // TODO(arjun): Calculate this methodically
  };

  getFileSha = element => {
    return this.fileSha;
  };

  getCharNumber = (element, mouseX) => {
    const lineElement = this.getLineElement(element);

    if (lineElement) {
      const bbox = lineElement.getBoundingClientRect();
      const charInPixels = mouseX - bbox.x - this.getPaddingLeft(lineElement);
      const fontSize = this.getFontSize(lineElement);
      const estimatedChars = this.getCharsFromPixels(charInPixels, fontSize);
      const tabSize = this.getTabSize(lineElement);
      const numTabs = this.getNumTabs(lineElement);
      return Math.round(estimatedChars - numTabs * (tabSize - 1));
    }

    return -1;
  };

  getLineNumber = node => {
    // Find closest td element ancestor who id starts with LC
    const lineElement = this.getLineElement(node);

    if (lineElement) {
      const nodeId = lineElement.id;
      return +nodeId.replace("LC", "") - 1; // for 0-indexed
    }

    return -1;
  };

  getFileUri = element => {
    const pathElement = document.getElementById("blob-path");

    if (pathElement !== null) {
      const fullPath = pathElement.textContent.trim();
      const firstSlashIndex = fullPath.indexOf("/");
      return fullPath.slice(firstSlashIndex + 1);
    }

    return -1;
  };

  getLineElement = node => {
    return node.parentElement.closest("td[id^=LC]");
  };
}

export const listener = (event, callback, fileSha) => {
  const pageListener = new BlobPageListener(fileSha);
  const result = pageListener.readXY(event.x, event.y);
  callback(result);
};
