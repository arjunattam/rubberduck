import React from "react";
import { connect } from "react-redux";
import PropTypes from "prop-types";
import { readXY as blobReadXY } from "../adapters/github/views/blob";
import { readXY as pullReadXY } from "../adapters/github/views/pull";
import SectionHeader from "./common/Section";
import ExpandedCode from "./common/ExpandedCode";
import CodeNode from "./common/CodeNode";
import Docstring from "./common/Docstring";
import { WS } from "./../utils/websocket";
import { decodeBase64 } from "../utils/data";
import "./Definitions.css";

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

  readPage = () => {
    const isFileView = window.location.href.indexOf("blob") >= 0;
    const isPRView = window.location.href.indexOf("pull") >= 0;

    if (isFileView) {
      return blobReadXY(
        this.props.selectionX,
        this.props.selectionY,
        this.props.data.repoDetails.branch
      );
    } else if (isPRView) {
      return pullReadXY(this.props.selectionX, this.props.selectionY);
    }

    return {};
  };

  getSelectionData = () => {
    const hoverResult = this.readPage();

    const isValidResult =
      hoverResult.hasOwnProperty("fileSha") &&
      hoverResult.hasOwnProperty("lineNumber");

    if (isValidResult && this.state.isVisible) {
      WS.getDefinition(
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

  render() {
    return (
      <div className="definitions-section">
        <SectionHeader
          onClick={this.toggleVisibility}
          isVisible={this.state.isVisible}
          name={"Definitions"}
        />
        {this.state.isVisible ? (
          <DefinitionItem {...this.state.definition} />
        ) : null}
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
