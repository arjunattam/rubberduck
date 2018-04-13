const SF_MONO_ASPECT_RATIO = 0.51;

export default class BaseViewListener {
  // This class defines the basic methods for a page DOM listener
  readXY = (mouseX, mouseY) => {
    // Given x, y this will read the DOM element
    const range = document.caretRangeFromPoint(mouseX, mouseY);

    if (range) {
      const rangeElement = range.commonAncestorContainer;
      return this.parseCommonAncestor(rangeElement, mouseX, mouseY);
    }

    return {};
  };

  parseCommonAncestor = (element, x, y) => {
    const result = {
      name: element.nodeValue,
      filePath: this.getFileUri(element),
      fileSha: this.getFileSha(element),
      lineNumber: this.getLineNumber(element),
      charNumber: this.getCharNumber(element, x, y),
      element: this.getElement(element),
      mouseX: x,
      mouseY: y
    };
    return this.isValidResult(result) ? result : {};
  };

  getElement = element => element.parentElement.closest("span");

  isValidResult = hoverResult => {
    return (
      this.hasTextUnderMouse(hoverResult) &&
      this.areValuesValid(hoverResult) &&
      this.isMouseOnElement(hoverResult)
    );
  };

  isMouseOnElement = hoverResult => {
    const { element, mouseX, mouseY } = hoverResult;
    const { x, y, width, height } = element.getBoundingClientRect();
    return (
      mouseX >= x && mouseX <= x + width && mouseY >= y && mouseY <= y + height
    );
  };

  hasTextUnderMouse = hoverResult => {
    const { element } = hoverResult;
    return element ? element.textContent !== "" : false;
  };

  getContentLength = element => {
    // This methods takes an element and returns content length with tab as spaces
    const lineContentLength = element.textContent.length;
    const numTabs = this.getNumTabs(element);
    const tabSize = this.getTabSize(element);
    return lineContentLength + numTabs * (tabSize - 1);
  };

  getFontAspectRatio = () => {
    // This will have to change if we need to support other fonts
    // Returns aspect ratio (w/h) for SF-Mono font
    return SF_MONO_ASPECT_RATIO;
  };

  getCharsFromPixels = (pixels, fontSize) => {
    return pixels / (this.getFontAspectRatio() * fontSize);
  };

  areValuesValid = result =>
    !Object.keys(result).some(function(k) {
      return result[k] < 0;
    });

  stripPx = value => +value.replace("px", "");

  getStyle = element => window.getComputedStyle(element);

  getFontSize = element => this.stripPx(this.getStyle(element).fontSize);

  getPaddingLeft = element => this.stripPx(this.getStyle(element).paddingLeft);

  getTabSize = element => +this.getStyle(element).tabSize;

  getNumTabs = element => element.textContent.split("\t").length - 1;
}
