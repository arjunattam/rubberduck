import React from "react";
import { bindActionCreators } from "redux";
import * as DataActions from "../../actions/dataActions";
import debounce from "debounce";
import HoverBox from "./HoverBox";

const DEBOUNCE_TIMEOUT = 1200; // ms
const CURSOR_RADIUS = 20; // pixels

/**
 * This component is responsible for making the API call and showing
 * the result.
 */
export default class HoverElement extends React.Component {
  constructor(props) {
    super(props);
    this.DataActions = bindActionCreators(DataActions, this.props.dispatch);
  }

  state = {
    apiResult: {},
    hoverResult: {},
    isHighlighted: false,
    underlinedElements: []
  };

  isValidResult = hoverResult => {
    const { name: hoverName } = hoverResult;
    const hasText = hoverName && hoverName.trim() !== "";
    return hasText;
  };

  callActions = () => {
    if (!this.isValidResult(this.state.hoverResult)) return;

    const { hoverResult } = this.state;
    this.DataActions.setHoverResult(hoverResult);
  };

  isOverlappingWithCurrent = (x, y) => {
    const { mouseX, mouseY } = this.state.hoverResult;
    const xdiff = Math.abs(x - mouseX);
    const ydiff = Math.abs(y - mouseY);
    return xdiff <= CURSOR_RADIUS && ydiff <= CURSOR_RADIUS;
  };

  getDefinitionPath = result => {
    const { definition } = result;
    return definition ? definition.location.path : "";
  };

  callAPI = () => {
    if (!this.isValidResult(this.props.hoverResult)) return;

    this.DataActions.callHover(this.props.hoverResult).then(response => {
      const { mouseX, mouseY } = this.props.hoverResult;
      const isForCurrentMouse = this.isOverlappingWithCurrent(mouseX, mouseY);
      const { result } = response.value;

      if (isForCurrentMouse) {
        // We will set state only if the current
        // mouse location overlaps with the response
        const apiResult = {
          ...result,
          filePath: this.getDefinitionPath(result)
        };
        this.setState({
          apiResult,
          hoverResult: this.props.hoverResult,
          isVisible: true
        });
      }
    });
  };

  onClick = event => (this.state.isHighlighted ? this.callActions() : null);

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
      this.setState({
        underlinedElements: [...this.state.underlinedElements, element]
      });
    }
  };

  removeUnderlineElements = () => {
    this.state.underlinedElements.forEach(element =>
      element.classList.remove("underlined")
    );
    this.setState({
      underlinedElements: []
    });
  };

  isMac = () => navigator.platform.indexOf("Mac") >= 0;

  isExpandKeyCode = event => {
    // Handles cmd key (left/right) on macOS and ctrl on other platforms
    const allowedCodes = this.isMac() ? [91, 93] : [17];
    return allowedCodes.indexOf(event.keyCode) >= 0;
  };

  onKeyDown = event => {
    if (this.isExpandKeyCode(event)) {
      this.setState({ isHighlighted: true });
    }
  };

  onKeyUp = event => {
    if (this.isExpandKeyCode(event)) {
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
    const didChangeHighlight =
      this.state.isHighlighted !== prevState.isHighlighted;

    if (didChangeChar || didChangeLine) {
      this.clearDebouce();
      const { hoverResult } = this.props;
      this.setState({ hoverResult, isVisible: false });
      this.dFunc = debounce(() => this.callAPI(), DEBOUNCE_TIMEOUT);
      this.dFunc();
    }

    if (didChangeElement || !this.state.isHighlighted) {
      this.removeSelectedElement(prevResult.element);
      this.selectElement(currentResult.element);
    }

    if (didChangeHighlight) {
      if (this.state.isHighlighted) {
        this.underlineElement(currentResult.element);
      } else {
        this.removeUnderlineElements();
      }
    }
  }

  clearDebouce = () => {
    if (this.dFunc !== undefined) this.dFunc.clear();
  };

  render() {
    return <HoverBox {...this.state} />;
  }
}
