import React from "react";
import { WS } from "../../utils/websocket";
import HoverBox from "./HoverBox";
const debounce = require("debounce");

const DEBOUNCE_TIMEOUT = 500; // ms
const CURSOR_RADIUS = 20; // pixels

export default class HoverElement extends React.Component {
  // Makes the API call and shows the presentation component: HoverBox
  state = {
    x: -1000,
    y: -1000,
    boundRect: {},
    isLoading: false
  };

  onReferences = () => {
    this.props.onReferences({ x: this.state.x, y: this.state.y });
  };

  onDefinition = () => {
    this.props.onDefinition({ x: this.state.x, y: this.state.y });
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

  callAPI = () => {
    const hoverXY = {
      x: this.props.hoverResult.mouseX,
      y: this.props.hoverResult.mouseY
    };
    this.startLoading();
    WS.getHover(
      this.props.hoverResult.fileSha,
      this.props.hoverResult.filePath,
      this.props.hoverResult.lineNumber,
      this.props.hoverResult.charNumber
    )
      .then(response => {
        this.stopLoading();
        const isForCurrentMouse = this.isOverlappingWithCurrent(
          hoverXY.x,
          hoverXY.y
        );
        if (isForCurrentMouse) {
          // We will set state only if the current
          // mouse location overlaps with the response
          let definitionPath = "";
          if (response.result.definition !== null) {
            definitionPath = response.result.definition.location.path;
          }
          this.setState({
            name: response.result.name,
            type: response.result.type,
            docstring: response.result.docstring,
            filePath: definitionPath,
            x: this.props.hoverResult.mouseX,
            y: this.props.hoverResult.mouseY,
            boundRect: this.props.hoverResult.boundRect
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
      this.setState({
        x: this.props.mouseX,
        y: this.props.mouseY,
        boundRect: this.props.hoverResult.boundRect
      });
    }
  };

  clear = () => {
    if (this.dFunc !== undefined) this.dFunc.clear();
    if (this.state.x > 0)
      this.setState({
        x: -1000,
        y: -1000,
        boundRect: {}
      });
  };

  componentDidUpdate(prevProps, prevState) {
    if (
      this.props.hoverResult.lineNumber !== prevProps.hoverResult.lineNumber ||
      this.props.hoverResult.charNumber !== prevProps.hoverResult.charNumber
    ) {
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
