import React from "react";
import PropTypes from "prop-types";
import { connect } from "react-redux";
import { readXY } from "./../adapters/github/views/pull";
import SectionHeader from "./common/Section";
import ExpandedCode from "./common/ExpandedCode";
import SmallCodeSnippet from "./common/SmallCodeSnippet";
import CodeNode from "./common/CodeNode";
import { API } from "./../utils/api";
import * as SessionUtils from "../utils/session";
import "./References.css";

class ReferenceItem extends React.Component {
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
        className="reference-item"
        onMouseEnter={this.handleMouseHover}
        onMouseLeave={this.handleMouseHover}
        ref={"container"}
      >
        <CodeNode {...this.props}>
          <SmallCodeSnippet
            contents={this.props.codeSnippet}
            lineNumber={this.props.lineNumber - this.props.startLineNumber}
          />
        </CodeNode>

        {this.state.isHovering ? (
          <ExpandedCode
            language={"python"}
            codeBase64={this.props.codeSnippet}
            top={this.getTop()}
            startLine={this.props.startLineNumber}
            filepath={this.props.file}
          />
        ) : null}
      </div>
    );
  }
}

class References extends React.Component {
  // This gets x and y of the selected text, constructs the
  // API call payload by reading DOM, and then display the
  // result of the API call.
  static propTypes = {
    selectionX: PropTypes.number,
    selectionY: PropTypes.number
  };

  state = {
    isVisible: false,
    references: []
  };

  getReferenceItems = apiResponse => {
    return apiResponse.references.map(reference => {
      const parent = reference.parent;
      let parentName = "";

      if (parent !== null) {
        parentName = parent.name;
      } else {
        parentName = reference.location.path.split("/").slice(-1)[0];
      }

      return {
        name: parentName,
        file: reference.location.path,
        lineNumber: reference.location.range.start.line,
        codeSnippet: reference.contents,
        startLineNumber: reference.contents_start_line
      };
    });
  };

  getSelectionData = () => {
    // Assumes PR view and gets file name, line number etc
    // from selection x and y
    const hoverResult = readXY(this.props.selectionX, this.props.selectionY);

    const isValidResult =
      hoverResult.hasOwnProperty("fileSha") &&
      hoverResult.hasOwnProperty("lineNumber");

    if (isValidResult) {
      API.getReferences(
        SessionUtils.getCurrentSessionId(this.props.data.sessions),
        hoverResult.fileSha,
        hoverResult.filePath,
        hoverResult.lineNumber,
        hoverResult.charNumber
      )
        .then(response => {
          this.setState({
            name: hoverResult.name,
            count: response.result.count,
            references: this.getReferenceItems(response.result)
          });
        })
        .catch(error => {
          console.log("Error in API call", error);
        });
    }
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

  toggleVisibility = () => {
    this.setState({
      isVisible: !this.state.isVisible
    });
  };

  render() {
    const referenceItems = this.state.references.map((reference, index) => {
      return <ReferenceItem {...reference} key={index} />;
    });

    return (
      <div className="references-section">
        <SectionHeader
          onClick={this.toggleVisibility}
          isVisible={this.state.isVisible}
          name={"References"}
        />
        {this.state.isVisible ? (
          <div className="reference-container">
            <div className="reference-title">
              <div className="reference-name monospace">{this.state.name}</div>
              <div className="reference-count">
                {this.state.count} references
              </div>
            </div>
            <div>{referenceItems}</div>{" "}
          </div>
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
export default connect(mapStateToProps)(References);
