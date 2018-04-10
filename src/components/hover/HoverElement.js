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
    isExpanded: false
  };

  onReferences = () => {
    const { mouseX, mouseY } = this.state.hoverResult;
    this.props.onReferences({ x: mouseX, y: mouseY });
  };

  onDefinition = () => {
    const { mouseX, mouseY } = this.state.hoverResult;
    this.props.onDefinition({ x: mouseX, y: mouseY });
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

  getLine = location => location.range.start.line;

  isDefinition = response => {
    const { definition, location } = response.result;
    return (
      definition && this.getLine(definition.location) === this.getLine(location)
    );
  };

  callAPI = () => {
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
          this.setState({
            apiResult: response.result,
            hoverResult: this.props.hoverResult,
            filePath: this.getDefinitionPath(response),
            isDefinition: this.isDefinition(response)
          });
        }
      })
      .catch(error => {
        this.stopLoading();
        this.clear();
        console.log("Error in API call", error);
      });
  };

  update = () => {
    const hoverName = this.props.hoverResult.name;
    const hasText = hoverName && hoverName.trim() !== "";

    if (hasText) {
      this.callAPI();
      const { hoverResult } = this.props;
      this.setState({ hoverResult });
    }
  };

  clear = () => {
    if (this.dFunc !== undefined) this.dFunc.clear();
    if (this.state.hoverResult.mouseX > 0) {
      this.setState({
        hoverResult: {},
        apiResult: {}
      });
    }
  };

  onClick = event => {
    const isVisible = this.props.hoverResult.mouseX > 0;
    if (this.state.isExpanded && isVisible) {
      this.doDefaultAction();
    }
  };

  doDefaultAction = () => {
    if (this.state.isDefinition) {
      this.onReferences();
    } else {
      this.onDefinition();
    }
  };

  selectElement = element => {
    if (
      element &&
      element.getBoundingClientRect &&
      element.tagName === "SPAN"
    ) {
      const fontColor = window.getComputedStyle(element).color;
      const withOpacity = fontColor.slice(0, -1) + ", 0.075)";
      element.style.backgroundColor = withOpacity;
    }
  };

  removeSelectedElement = element => {
    if (element && element.style) element.style.backgroundColor = null;
  };

  underlineElement = () => {
    const element = this.props.hoverResult.element;

    if (element && element.getBoundingClientRect) {
      element.classList.add("underlined");
    }
  };

  removeUnderlineElement = () => {
    const element = this.props.hoverResult.element;

    if (element && element.getBoundingClientRect) {
      element.classList.remove("underlined");
    }
  };

  isExpandKeyCode = keyCode => {
    // Handles command key left/right on Mac
    return keyCode === 91 || keyCode === 93;
  };

  onKeyDown = event => {
    if (this.isExpandKeyCode(event.keyCode)) {
      this.underlineElement();
      this.setState({ isExpanded: true });
    }
  };

  onKeyUp = event => {
    if (this.isExpandKeyCode(event.keyCode)) {
      this.removeUnderlineElement();
      this.setState({ isExpanded: false });
    }
  };

  componentDidMount() {
    document.addEventListener("keydown", this.onKeyDown);
    document.addEventListener("keyup", this.onKeyUp);
    document.addEventListener("click", this.onClick);
  }

  componentWillReceiveProps(newProps) {
    if (newProps.hoverResult.element !== this.props.hoverResult.element) {
      this.removeSelectedElement(this.props.hoverResult.element);
      this.selectElement(newProps.hoverResult.element);
    }
  }

  componentDidUpdate(prevProps, prevState) {
    const { hoverResult: prevResult } = prevProps;
    const { hoverResult: currentResult } = this.props;
    const didChangeLine = currentResult.lineNumber !== prevResult.lineNumber;
    const didChangeChar = currentResult.charNumber !== prevResult.charNumber;

    if (didChangeChar || didChangeLine) {
      // Props have been updated, so make API call if we are on new line/char
      this.clear();
      this.dFunc = debounce(() => this.update(), DEBOUNCE_TIMEOUT);
      this.dFunc();
    }
  }

  render() {
    return <HoverBox {...this.state} />;
  }
}
