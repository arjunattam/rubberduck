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
    isLoading: false
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
            element
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
    if (this.state.x > 0)
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
  };

  componentDidUpdate(prevProps, prevState) {
    const didChangeLine =
      this.props.hoverResult.lineNumber !== prevProps.hoverResult.lineNumber;
    const didChangeChar =
      this.props.hoverResult.charNumber !== prevProps.hoverResult.charNumber;

    if (didChangeChar || didChangeLine) {
      // Props have been updated, so make API call if we are on new line/char
      this.clear();
      this.dFunc = debounce(() => this.update(), DEBOUNCE_TIMEOUT);
      this.dFunc();
    }
  }

  render() {
    return (
      <HoverBox
        {...this.state}
        onReferences={() => this.onReferences()}
        onDefinition={() => this.onDefinition()}
      />
    );
  }
}
