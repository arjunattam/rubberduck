import React from "react";
import { connect } from "react-redux";
import { bindActionCreators } from "redux";
import * as DataActions from "../../actions/dataActions";
import { API } from "../../utils/api";
import * as SessionUtils from "../../utils/session";
import HoverBox from "./HoverBox";

class HoverElement extends React.Component {
  // Makes the API call and shows the presentiation component: HoverBox
  constructor(props) {
    super(props);
    this.DataActions = bindActionCreators(DataActions, this.props.dispatch);
  }

  state = {
    x: -1000,
    y: -1000,
    hoverResult: {}
  };

  isOverlappingWithCurrent = (x, y) => {
    const xdiff = Math.abs(x - this.state.x);
    const ydiff = Math.abs(y - this.state.y);
    return xdiff < 5 && ydiff < 5;
  };

  triggerAction = actionName => {
    this.DataActions.updateData({
      openSection: actionName,
      textSelection: { x: this.state.x, y: this.state.y }
    });
  };

  onReferences = () => {
    this.triggerAction("references");
  };

  onDefinition = () => {
    this.triggerAction("definitions");
  };

  callAPI = () => {
    const hoverXY = {
      x: this.props.hoverResult.mouseX,
      y: this.props.hoverResult.mouseY
    };
    API.getHover(
      SessionUtils.getCurrentSessionId(this.props.storage.sessions),
      this.props.hoverResult.fileSha,
      this.props.hoverResult.filePath,
      this.props.hoverResult.lineNumber,
      this.props.hoverResult.charNumber
    )
      .then(response => {
        const isForCurrentMouse = this.isOverlappingWithCurrent(
          hoverXY.x,
          hoverXY.y
        );
        if (isForCurrentMouse) {
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
            x: this.props.hoverResult.mouseX,
            y: this.props.hoverResult.mouseY
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
      // Props have been updated, so make API call if we are on new line/char
      this.callAPI(prevProps);
    }
  }

  componentWillReceiveProps(newProps) {
    this.setState({
      x: newProps.mouseX,
      y: newProps.mouseY,
      hover: {}
    });
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

function mapStateToProps(state) {
  const { storage, data } = state;
  return {
    storage,
    data
  };
}
export default connect(mapStateToProps)(HoverElement);
