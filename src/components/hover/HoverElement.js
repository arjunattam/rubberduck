import React from "react";
import { WS } from "../../utils/websocket";
import HoverBox from "./HoverBox";
import debounce from "debounce";

const DEBOUNCE_TIMEOUT = 1200; // ms
const CURSOR_RADIUS = 20; // pixels

export default class HoverElement extends React.Component {
  // Makes the API call and shows the presentation component: HoverBox
  state = {
    apiResult: {},
    hoverResult: {},
    isLoading: false,
    isHighlighted: false
  };

  callActions = () => {
    this.props.callActions();
  };

  isOverlappingWithCurrent = (x, y) => {
    const { mouseX, mouseY } = this.state.hoverResult;
    const xdiff = Math.abs(x - mouseX);
    const ydiff = Math.abs(y - mouseY);
    return xdiff <= CURSOR_RADIUS && ydiff <= CURSOR_RADIUS;
  };

  startLoading = () => {
    this.setState({
      isLoading: true
    });
  };

  stopLoading = () => {
    this.setState({
      isLoading: false
    });
  };

  getDefinitionPath = response => {
    const { definition } = response.result;
    return definition ? definition.location.path : "";
  };

  isValidHoverResult = () => {
    const hoverName = this.props.hoverResult.name;
    const hasText = hoverName && hoverName.trim() !== "";
    return hasText;
  };

  callAPI = () => {
    if (!this.isValidHoverResult()) return;
    this.startLoading();
    const { fileSha, filePath } = this.props.hoverResult;
    const { lineNumber, charNumber } = this.props.hoverResult;

    WS.getHover(fileSha, filePath, lineNumber, charNumber)
      .then(response => {
        this.stopLoading();
        const { mouseX, mouseY } = this.props.hoverResult;
        const isForCurrentMouse = this.isOverlappingWithCurrent(mouseX, mouseY);

        if (isForCurrentMouse) {
          // We will set state only if the current
          // mouse location overlaps with the response
          const apiResult = {
            ...response.result,
            filePath: this.getDefinitionPath(response)
          };
          this.setState({
            apiResult,
            hoverResult: this.props.hoverResult,
            isVisible: true
          });
        }
      })
      .catch(error => {
        this.stopLoading();
        this.clearDebouce();
        console.log("Error in API call", error);
      });
  };

  onClick = event => {
    if (this.state.isHighlighted) {
      this.callActions();
    }
  };

  selectElement = element => {
    if (this.isValidElement(element)) {
      const fontColor = window.getComputedStyle(element).color;
      const withOpacity = fontColor.slice(0, -1) + ", 0.075)";
      element.style.backgroundColor = withOpacity;
    }
  };

  removeSelectedElement = element => {
    if (element && element.style) element.style.backgroundColor = null;
  };

  isValidElement = element => {
    const isElement = element && element.getBoundingClientRect;
    if (isElement) {
      const validTags = ["SPAN", "INS", "DEL"];
      return validTags.indexOf(element.tagName) >= 0;
    } else {
      return false;
    }
  };

  underlineElement = element => {
    if (this.isValidElement(element)) {
      element.classList.add("underlined");
    }
  };

  removeUnderlineElement = element => {
    if (this.isValidElement(element)) {
      element.classList.remove("underlined");
    }
  };

  isExpandKeyCode = keyCode => {
    // Handles command key left/right on Mac
    return keyCode === 91 || keyCode === 93;
  };

  onKeyDown = event => {
    if (this.isExpandKeyCode(event.keyCode)) {
      this.setState({ isHighlighted: true });
    }
  };

  onKeyUp = event => {
    if (this.isExpandKeyCode(event.keyCode)) {
      this.setState({ isHighlighted: false });
    }
  };

  componentDidMount() {
    document.addEventListener("keydown", this.onKeyDown);
    document.addEventListener("keyup", this.onKeyUp);
    document.addEventListener("click", this.onClick);
  }

  didChangeElement(newResult, oldResult) {
    if (!newResult.element || !oldResult.element) return true;
    return newResult.element.nodeValue !== oldResult.element.nodeValue;
  }

  componentDidUpdate(prevProps, prevState) {
    const { hoverResult: prevResult } = prevProps;
    const { hoverResult: currentResult } = this.props;
    const didChangeLine = currentResult.lineNumber !== prevResult.lineNumber;
    const didChangeChar = currentResult.charNumber !== prevResult.charNumber;
    const didChangeElement = this.didChangeElement(currentResult, prevResult);

    if (didChangeChar || didChangeLine) {
      this.clearDebouce();
      const { hoverResult } = this.props;
      this.setState({ hoverResult, isVisible: false });
      this.dFunc = debounce(() => this.callAPI(), DEBOUNCE_TIMEOUT);
      this.dFunc();
    }

    if (didChangeElement || !this.state.isHighlighted) {
      this.removeSelectedElement(prevResult.element);
      this.removeUnderlineElement(prevResult.element);
      this.selectElement(currentResult.element);
    }

    if (this.state.isHighlighted) {
      this.underlineElement(currentResult.element);
    }
  }

  clearDebouce = () => {
    if (this.dFunc !== undefined) this.dFunc.clear();
  };

  render() {
    return <HoverBox {...this.state} />;
  }
}
