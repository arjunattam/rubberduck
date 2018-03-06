import React from "react";
import { connect } from "react-redux";
import PropTypes from "prop-types";
import { readXY } from "./../adapters/github/views/pull";
import SectionHeader from "./common/Section";
import ExpandedCode from "./common/ExpandedCode";
import CodeNode from "./common/CodeNode";
import Docstring from "./common/Docstring";
// import { API } from "./../utils/api";
import { WS } from "./../utils/websocket";
import { decodeBase64 } from "../utils/data";
import "./Definitions.css";
import * as SessionUtils from "../utils/session";

class DefinitionItem extends React.Component {
  state = {
    isHovering: false
  };

  handleMouseHover = () => {
    this.setState({
      isHovering: !this.state.isHovering
    });
  };

  getTop = () => {
    return this.refs.container.getBoundingClientRect().top;
  };

  render() {
    return (
      <div
        className="definition-item"
        onMouseEnter={this.handleMouseHover}
        onMouseLeave={this.handleMouseHover}
        ref={"container"}
      >
        <CodeNode name={this.props.name} file={this.props.filePath}>
          <div className="definition-docstring">
            {this.props.docstring
              ? Docstring(decodeBase64(this.props.docstring))
              : "docstring goes here"}
          </div>
        </CodeNode>

        {this.state.isHovering ? (
          <ExpandedCode
            language={"python"}
            codeBase64={this.props.codeSnippet}
            top={this.getTop()}
            startLine={this.props.startLineNumber}
            lineNumber={this.props.lineNumber}
            filepath={this.props.filePath}
          />
        ) : null}
      </div>
    );
  }
}

class Definitions extends React.Component {
  // This gets x and y of the selected text, constructs the
  // API call payload by reading DOM, and then display the
  // result of the API call.
  static propTypes = {
    selectionX: PropTypes.number,
    selectionY: PropTypes.number
  };

  state = {
    isVisible: false,
    definition: {}
  };

  toggleVisibility = () => {
    this.setState({
      isVisible: !this.state.isVisible
    });
  };

  componentWillReceiveProps(newProps) {
    if (newProps.isVisible !== this.state.isVisible) {
      this.setState({ isVisible: newProps.isVisible });
    }
  }

  componentDidUpdate(prevProps, prevState) {
    if (
      prevProps.selectionX !== this.props.selectionX ||
      prevProps.selectionY !== this.props.selectionY
    ) {
      this.getSelectionData();
    }
  }

  getSelectionData = () => {
    // Assumes PR view and gets file name, line number etc
    // from selection x and y
    const hoverResult = readXY(this.props.selectionX, this.props.selectionY);

    const isValidResult =
      hoverResult.hasOwnProperty("fileSha") &&
      hoverResult.hasOwnProperty("lineNumber");

    if (isValidResult && this.state.isVisible) {
      WS.getDefinition(
        SessionUtils.getCurrentSessionId(this.props.storage.sessions),
        hoverResult.fileSha,
        hoverResult.filePath,
        hoverResult.lineNumber,
        hoverResult.charNumber
      )
        .then(response => {
          let filePath = response.result.definition.location
            ? response.result.definition.location.path
            : "";
          const definition = {
            name: response.result.name,
            filePath: filePath,
            startLineNumber: response.result.definition.contents_start_line,
            lineNumber: response.result.definition.location.range.start.line,
            docstring: response.result.docstring,
            codeSnippet: response.result.definition.contents
          };
          this.setState({ definition: definition });
        })
        .catch(error => {
          console.log("Error in API call", error);
        });
    }
  };

  componentDidMount = () => {
    // We have props, so we will make an API call to get data
    this.getSelectionData();
  };

  render() {
    let definitonClassName = this.state.isVisible
      ? "definitions-section"
      : "definitions-section collapsed";
    return (
      <div className={definitonClassName}>
        <SectionHeader
          onClick={this.toggleVisibility}
          isVisible={this.state.isVisible}
          name={"Definitions"}
        />
        <DefinitionItem
          {...this.state.definition}
          visible={this.state.isVisible}
        />
      </div>
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
export default connect(mapStateToProps)(Definitions);
