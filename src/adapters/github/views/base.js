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

  hasTextUnderMouse = (element, x, y) => {
    // Compute if there is text below the element
    // Get the bounding box of the element
    const boundRect = element.parentElement.getBoundingClientRect();
    let hasTextOnMouse = true;
    // If bounding box covers more width than x, we are good
    return boundRect.x + boundRect.width > x;
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
