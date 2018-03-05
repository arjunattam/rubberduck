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
      charNumber: this.getCharNumber(element, x),
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
    // Overriding base method because this calculation is different
    const node = element.parentElement; // This represents entire code line

    try {
      const tdElement = node.closest("td.blob-code");
      const boundRect = tdElement.getBoundingClientRect();
      const lineContentLength = tdElement.textContent.length;
      const elStyle = window.getComputedStyle(tdElement);
      const lineHeight = this.stripPx(elStyle.fontSize);
      // Check if line content width is greater than x
      const padding = this.stripPx(elStyle.paddingLeft);
      const widthWithText =
        this.getPixelsFromChar(lineContentLength, lineHeight) +
        boundRect.x +
        padding;
      return widthWithText > x;
    } catch (err) {
      return false;
    }
  };

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

  stripPx = value => {
    // Get `12px` and return `12`
    return +value.replace("px", "");
  };
}
