import React from "react";
import { WS } from "../../utils/websocket";
import HoverBox from "./HoverBox";
import debounce from "debounce";

const DEBOUNCE_TIMEOUT = 1200; // ms
const CURSOR_RADIUS = 20; // pixels

export default class HoverElement extends React.Component {
  // Makes the API call and shows the presentation component: HoverBox
  state = {
    x: -1000,
    y: -1000,
    element: {},
    isLoading: false,
    isExpanded: false
  };

  onReferences = () => {
    const { x, y } = this.state;
    this.props.onReferences({ x, y });
  };

  onDefinition = () => {
    const { x, y } = this.state;
    this.props.onDefinition({ x, y });
  };

  isOverlappingWithCurrent = (x, y) => {
    const xdiff = Math.abs(x - this.state.x);
    const ydiff = Math.abs(y - this.state.y);
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
    const { mouseX, mouseY, element } = this.props.hoverResult;
    const { fileSha, filePath } = this.props.hoverResult;
    const { lineNumber, charNumber } = this.props.hoverResult;

    WS.getHover(fileSha, filePath, lineNumber, charNumber)
      .then(response => {
        this.stopLoading();
        const isForCurrentMouse = this.isOverlappingWithCurrent(mouseX, mouseY);

        if (isForCurrentMouse) {
          // We will set state only if the current
          // mouse location overlaps with the response
          this.setState({
            ...response.result,
            filePath: this.getDefinitionPath(response),
            x: mouseX,
            y: mouseY,
            element,
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
      const { mouseX: x, mouseY: y, element } = this.props.hoverResult;
      this.setState({ x, y, element });
    }
  };

  clear = () => {
    if (this.dFunc !== undefined) this.dFunc.clear();
    if (this.state.x > 0) {
      this.setState({
        x: -1000,
        y: -1000,
        element: {},
        name: "",
        signature: "",
        type: "",
        docstring: "",
        filePath: ""
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
    console.log("removing", element);
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
