import React from "react";
import { connect } from "react-redux";
import { API } from "../../utils/api";
import * as SessionUtils from "../../utils/session";
import HoverBox from "./HoverBox";

class HoverElement extends React.Component {
  // Makes the API call and shows the presentiation component: HoverBox
  state = {
    mouseX: -1000,
    mouseY: -1000,
    hoverResult: {}
  };
  isOverlappingWithCurrent = (x, y, prevProps) => {
    const xdiff = Math.abs(x - prevProps.currentMouseX);
    const ydiff = Math.abs(y - prevProps.currentMouseY);
    return xdiff < 5 && ydiff < 5;
  };

  callAPI = prevProps => {
    API.getHover(
      SessionUtils.getCurrentSessionId(this.props.data.sessions),
      this.props.hoverResult.fileSha,
      this.props.hoverResult.filePath,
      this.props.hoverResult.lineNumber,
      this.props.hoverResult.charNumber
    )
      .then(response => {
        // const isForCurrentMouse = this.isOverlappingWithCurrent(
        //   this.props.hoverResult.mouseX,
        //   this.props.hoverResult.mouseY,
        //   prevProps
        // );
        console.log("response", response);
        if (true) {
          // We will set state only if the current
          // mouse location overlaps with the response
          let definitionPath = "";
          if (response.result.definition.location !== null) {
            definitionPath = response.result.definition.location.path;
          }
          this.setState({
            name: response.result.name,
            type: response.result.type,
            docstring: response.result.docstring,
            filePath: definitionPath,
            mouseX: this.props.hoverResult.mouseX,
            mouseY: this.props.hoverResult.mouseY
          });
        }
      })
      .catch(error => {
        console.log("Error in API call", error);
      });
  };

  componentDidUpdate(prevProps, prevState) {
    if (
      this.props.hoverResult.lineNumber !== prevProps.hoverResult.lineNumber ||
      this.props.hoverResult.charNumber !== prevProps.hoverResult.charNumber
    ) {
      // Props have been updated, so make API call
      this.callAPI(prevProps);
    }
  }

  render() {
    // console.log(this.props, this.state);
    return (
      <HoverBox
        {...this.state}
        mouseX={this.state.mouseX}
        mouseY={this.state.mouseY}
      />
    );
  }
}

function mapStateToProps(state) {
  const { storage, data } = state;
  return {
    storage,
    data
  };
}
export default connect(mapStateToProps)(HoverElement);
