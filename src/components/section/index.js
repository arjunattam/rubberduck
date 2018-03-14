import React from "react";
import PropTypes from "prop-types";
import SectionHeader from "./Section";
import { getReader } from "../../adapters/github/views/helper";

export class BaseSection extends React.Component {
  componentWillReceiveProps(newProps) {
    if (newProps.isVisible !== this.state.isVisible) {
      this.setState({ isVisible: newProps.isVisible });
    }
  }

  toggleVisibility = () => {
    this.setState({
      isVisible: !this.state.isVisible
    });
  };

  renderSectionHeader = name => (
    <SectionHeader
      onClick={() => this.toggleVisibility()}
      isVisible={this.state.isVisible}
      name={name}
    />
  );
}

export class BaseReaderSection extends BaseSection {
  static propTypes = {
    selectionX: PropTypes.number,
    selectionY: PropTypes.number
  };

  componentDidUpdate(prevProps, prevState) {
    const hasSelectionChanged =
      prevProps.selectionX !== this.props.selectionX ||
      prevProps.selectionY !== this.props.selectionY;
    const hasVisibilityChanged = prevProps.isVisible !== this.props.isVisible;
    if (hasSelectionChanged || hasVisibilityChanged) {
      this.getSelectionData();
    }
  }

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
