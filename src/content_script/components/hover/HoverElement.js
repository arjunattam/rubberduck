import React from "react";
import { bindActionCreators } from "redux";
import * as DataActions from "../../actions/dataActions";
import { isMac } from "../../adapters";
import debounce from "debounce";
import HoverBox from "./HoverBox";

const API_DEBOUNCE_TIMEOUT = 100; // ms
const VISIBILITY_DEBOUNCE_TIMEOUT = 750; // ms
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
    if (!this.isValidResult(this.state.hoverResult)) {
      return;
    }

    const { hoverResult } = this.state;
    this.DataActions.setHoverResult(hoverResult);
  };

  isOverlappingWithCurrent = (x, y) => {
    const { mouseX, mouseY } = this.state.hoverResult;
    const xdiff = Math.abs(x - mouseX);
    const ydiff = Math.abs(y - mouseY);
    return xdiff <= CURSOR_RADIUS && ydiff <= CURSOR_RADIUS;
  };

  callAPI = async () => {
    if (!this.isValidResult(this.props.hoverResult)) {
      return;
    }

    this.clearApiResult();
    const params = {
      // TODO: this can also be base --> check via hoverResult
      repo: this.props.data.view.head,
      query: {
        path: this.props.hoverResult.filePath,
        line: this.props.hoverResult.lineNumber,
        character: this.props.hoverResult.charNumber
      }
    };

    const response = await this.DataActions.callHover(params);
    const { mouseX, mouseY } = this.props.hoverResult;
    const isForCurrentMouse = this.isOverlappingWithCurrent(mouseX, mouseY);
    const { value: result } = response;

    if (isForCurrentMouse) {
      // We will set state only if the current
      // mouse location overlaps with the response
      this.setState({
        apiResult: result,
        hoverResult: this.props.hoverResult
      });
    }
  };

  onClick = event => {
    return this.state.isHighlighted ? this.callActions() : null;
  };

  selectElement = element => {
    if (this.isValidElement(element)) {
      const fontColor = window.getComputedStyle(element).color;
      const withOpacity = fontColor.slice(0, -1) + ", 0.075)";
      element.style.backgroundColor = withOpacity;
    }
  };

  removeSelectedElement = element => {
    if (element && element.style) {
      element.style.backgroundColor = null;
    }
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

  isExpandKeyCode = event => {
    // Handles cmd key (left/right) on macOS and ctrl on other platforms
    const allowedCodes = isMac() ? [91, 93] : [17];
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
    if (!newResult.element || !oldResult.element) {
      return true;
    }

    return newResult.element.nodeValue !== oldResult.element.nodeValue;
  }

  componentWillReceiveProps(newProps) {
    const { isOnHoverBox: prevIsOnBox } = this.props;
    const { isOnHoverBox } = newProps;
    const didChangeMouseOnBox = isOnHoverBox !== prevIsOnBox;

    if (didChangeMouseOnBox) {
      if (isOnHoverBox) {
        this.setState({ isHighlighted: true });
      } else {
        this.setState({ isHighlighted: false });
      }
    }
  }

  clearDebouce = () => {
    if (this.debouncedApiCall !== undefined) {
      this.debouncedApiCall.clear();
    }

    if (this.debouncedVisibility !== undefined) {
      this.debouncedVisibility.clear();
    }
  };

  clearApiResult = () => {
    if (this.state.apiResult.name) {
      this.setState({ apiResult: {} });
    }
  };

  setupDebounce = () => {
    this.debouncedApiCall = debounce(
      () => this.callAPI(),
      API_DEBOUNCE_TIMEOUT
    );
    this.debouncedVisibility = debounce(
      () => this.setState({ isVisible: true }),
      VISIBILITY_DEBOUNCE_TIMEOUT
    );

    this.debouncedApiCall();
    this.debouncedVisibility();
  };

  isLoading = () => this.props.data.section.isLoading.hover;

  componentDidUpdate(prevProps, prevState) {
    const { hoverResult: prevResult } = prevProps;
    const { hoverResult } = this.props;
    const didChangeLine = hoverResult.lineNumber !== prevResult.lineNumber;
    const didChangeChar = hoverResult.charNumber !== prevResult.charNumber;
    const didChangeElement = this.didChangeElement(hoverResult, prevResult);

    const didChangeHighlight =
      this.state.isHighlighted !== prevState.isHighlighted;

    if (didChangeChar || didChangeLine) {
      // The component maintains two debounce functions: one for the API call
      // and the other for the hover box visibility.
      this.clearDebouce();
      const { hoverResult } = this.props;
      this.setState({ hoverResult, isVisible: false });
      this.setupDebounce();
    }

    if (didChangeElement || !this.state.isHighlighted) {
      this.removeSelectedElement(prevResult.element);
      this.selectElement(hoverResult.element);
    }

    if (didChangeHighlight) {
      if (this.state.isHighlighted) {
        this.underlineElement(hoverResult.element);
      } else {
        this.removeUnderlineElements();
      }
    }
  }

  render() {
    return <HoverBox {...this.state} isLoading={this.isLoading()} />;
  }
}
