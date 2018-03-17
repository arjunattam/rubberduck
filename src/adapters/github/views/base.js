const SF_MONO_ASPECT_RATIO = 0.51;

export default class BaseListener {
  // This class defines the basic methods for a page DOM listener
  readXY = (mouseX, mouseY) => {
    // Given x, y this will read the DOM element
    const range = document.caretRangeFromPoint(mouseX, mouseY);
    const rangeElement = range.commonAncestorContainer;
    return this.parseCommonAncestor(rangeElement, mouseX, mouseY);
  };

  parseCommonAncestor = (element, x, y) => {
    const result = {
      name: element.nodeValue,
      filePath: this.getFileUri(element),
      fileSha: this.getFileSha(element),
      lineNumber: this.getLineNumber(element),
      charNumber: this.getCharNumber(element, x, y),
      boundRect: this.getBoundRect(element),
      mouseX: x,
      mouseY: y
    };
    return this.isValidResult(element, x, y, result) ? result : {};
  };

  isValidResult = (element, x, y, hoverResult) => {
    return (
      this.hasTextUnderMouse(element, x, y) && this.valuesAreValid(hoverResult)
    );
  };

  hasTextUnderMouse = (element, x, y) => {
    const node = element.parentElement; // This represents entire code line

    try {
      const tdElement = node.closest("td.blob-code");
      const lineContentLength = this.getContentLength(tdElement);
      const lineHeight = this.getFontSize(tdElement);
      // Check if line content width is greater than x
      const widthWithText =
        this.getPixelsFromChar(lineContentLength, lineHeight) +
        tdElement.getBoundingClientRect().x +
        this.getPaddingLeft(tdElement);
      return widthWithText > x;
    } catch (err) {
      return false;
    }
  };

  getContentLength = element => {
    // This methods takes an element and returns content length with tab as spaces
    const lineContentLength = element.textContent.length;
    const numTabs = this.getNumTabs(element);
    const tabSize = this.getTabSize(element);
    return lineContentLength + numTabs * (tabSize - 1);
  };

  getBoundRect = element => element.parentElement.getBoundingClientRect();

  getFontAspectRatio = () => {
    // This will have to change if we need to support other fonts
    // Returns aspect ratio (w/h) for SF-Mono font
    return SF_MONO_ASPECT_RATIO;
  };

  getPixelsFromChar = (chars, fontSize) => {
    return chars * (this.getFontAspectRatio() * fontSize);
  };

  getCharsFromPixels = (pixels, fontSize) => {
    return pixels / (this.getFontAspectRatio() * fontSize);
  };

  valuesAreValid = result => {
    // Returns true if the values in the result object
    // are >= 0
    return !Object.keys(result).some(function(k) {
      return result[k] < 0;
    });
  };

  stripPx = value => +value.replace("px", "");

  getStyle = element => window.getComputedStyle(element);

  getFontSize = element => this.stripPx(this.getStyle(element).fontSize);

  getPaddingLeft = element => this.stripPx(this.getStyle(element).paddingLeft);

  getTabSize = element => +this.getStyle(element).tabSize;

  getNumTabs = element => element.textContent.split("\t").length - 1;
}
