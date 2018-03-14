import React from "react";
import PropTypes from "prop-types";
import { getReader } from "../../adapters/github/views/helper";

export default class BaseSection extends React.Component {
  static propTypes = {
    selectionX: PropTypes.number,
    selectionY: PropTypes.number
  };

  componentWillReceiveProps(newProps) {
    if (newProps.isVisible !== this.state.isVisible) {
      this.setState({ isVisible: newProps.isVisible });
    }
  }

  componentDidUpdate(prevProps, prevState) {
    const hasSelectionChanged =
      prevProps.selectionX !== this.props.selectionX ||
      prevProps.selectionY !== this.props.selectionY;
    const hasVisibilityChanged = prevProps.isVisible !== this.props.isVisible;
    if (hasSelectionChanged || hasVisibilityChanged) {
      this.getSelectionData();
    }
  }

  toggleVisibility = () => {
    this.setState({
      isVisible: !this.state.isVisible
    });
  };

  readPage = () => {
    const reader = getReader();

    if (reader !== null) {
      return reader(
        this.props.selectionX,
        this.props.selectionY,
        this.props.data.repoDetails.branch
      );
    }

    return {};
  };
}
