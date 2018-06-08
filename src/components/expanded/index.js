import React from "react";
import { bindActionCreators } from "redux";
import Store from "../../store";
import Codebox from "./Codebox";
import Title from "./Title";
import * as DataActions from "../../actions/dataActions";
import "./ExpandedCode.css";

const MAX_HEIGHT = 400; // pixels
const PADDING = 75;

export default class ExpandedCode extends React.Component {
  constructor(props) {
    super(props);
    this.DataActions = bindActionCreators(DataActions, Store.dispatch);
  }

  getStyle = () => {
    let { top } = this.props.style;

    // This `top` could mean box is too close to the bottom of the window
    if (top + MAX_HEIGHT + PADDING >= window.innerHeight) {
      top = window.innerHeight - MAX_HEIGHT - PADDING;
    }

    return { ...this.props.style, top };
  };

  render() {
    return (
      <div className="expanded-code" style={this.getStyle()}>
        <Title {...this.props} urlLoader={this.DataActions.loadUrl} />
        <Codebox {...this.props} />
      </div>
    );
  }
}
