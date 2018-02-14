import React from "react";
import PropTypes from "prop-types";
import { readXY } from "./../adapters/github/views/pull";
import SectionHeader from "./common/Section";
import ExpandedCode from "./common/ExpandedCode";
import CodeNode from "./common/CodeNode";
import Docstring from "./common/Docstring";
import { API } from "./../utils/api";
import "./Definitions.css";

const sessionId = "7b8ccbba-3db0-40e5-a7af-6e4a3e69f40d";

const definitionSample = {
  name: "PythonLSClient",
  baseName: "BaseLSClient",
  filePath: "apps/ls_clients/python.py",
  lineNumber: 25,
  docstring:
    "Q2xhc3MgdGhhdCBtYWludGFpbnMgdGhlIGNsaWVudCBhbmQgc2VydmVyIGxpZmVjeWNsZQ0KZm9yIHRoZSBsYW5ndWFnZSBzZXJ2ZXIuIFRvIHVzZSwgdXNlIHRoZSBgd2l0aGAga2V5d29yZA0KDQp3aXRoIFB5dGhvbkxTQ2xpZW50KCkgYXMgcGxzOg0KLi4uDQoNClRoaXMgd2lsbCBlbnN1cmUgdGhhdCB0aGUgY2xpZW50L3NlcnZlciBhcmUgc2h1dGRvd24NCnByb3Blcmx5IGF0IHRoZSBlbmQgb2YgdGhlIGV4ZWN1dGlvbi4=",
  codeSnippet:
    "DQpjbGFzcyBQeXRob25MU0NsaWVudChCYXNlTFNDbGllbnQpOg0KICAgICcnJw0KICAgIENsYXNzIHRoYXQgbWFpbnRhaW5zIHRoZSBjbGllbnQgYW5kIHNlcnZlciBsaWZlY3ljbGUNCiAgICBmb3IgdGhlIGxhbmd1YWdlIHNlcnZlci4gVG8gdXNlLCB1c2UgdGhlIGB3aXRoYCBrZXl3b3JkDQogICAgd2l0aCBQeXRob25MU0NsaWVudCgpIGFzIHBsczoNCiAgICAgICAgLi4uDQogICAgVGhpcyB3aWxsIGVuc3VyZSB0aGF0IHRoZSBjbGllbnQvc2VydmVyIGFyZSBzaHV0ZG93bg0KICAgIHByb3Blcmx5IGF0IHRoZSBlbmQgb2YgdGhlIGV4ZWN1dGlvbi4NCiAgICAnJycNCiAgICBMQU5HVUFHRV9JRCA9ICdweXRob24nDQogICAgRklMRV9FWFRFTlNJT04gPSAnLnB5Jw0KDQogICAgZGVmIF9faW5pdF9fKHNlbGYsIHByb2plY3RfcGF0aCk6DQogICAgICAgICcnJw0KICAgICAgICBTZXRzIHVwIHR3byB0aHJlYWRzLCBvbmUgZm9yIHRoZSBjbGllbnQsIGFuZCBvdGhlcg0KICAgICAgICBmb3IgdGhlIHNlcnZlci4gQWxzbyBzZXRzIHVwIHRoZSB1bml4IHNvY2tldHMgYmV0d2Vlbg0KICAgICAgICB0aGVzZSB0d28uDQogICAgICAgICcnJw0KICAgICAgICBzZWxmLlBST0pFQ1RfUEFUSCA9IHByb2plY3RfcGF0aA0KICAgICAgICBjc3IsIGNzdyA9IG9zLnBpcGUoKSAgIyBDbGllbnQgdG8gU2VydmVyIHBpcGUNCiAgICAgICAgc2NyLCBzY3cgPSBvcy5waXBlKCkgICMgU2VydmVyIHRvIENsaWVudCBwaXBlDQogICAgICAgIHNlcnZlciA9IFRocmVhZCh0YXJnZXQ9c3RhcnRfaW9fbGFuZ19zZXJ2ZXIsIGFyZ3M9KA0KICAgICAgICAgICAgb3MuZmRvcGVuKGNzciwgJ3JiJyksIG9zLmZkb3BlbihzY3csICd3YicpLCBQeXRob25MYW5ndWFnZVNlcnZlcg0KICAgICAgICApKQ0KICAgICAgICBzZXJ2ZXIuZGFlbW9uID0gVHJ1ZQ0KICAgICAgICBzZXJ2ZXIuc3RhcnQoKQ0KICAgICAgICBjbGllbnQgPSBKU09OUlBDQ2xpZW50KG9zLmZkb3BlbihzY3IsICdyYicpLCBvcy5mZG9wZW4oY3N3LCAnd2InKSkNCiAgICAgICAgc2VsZi5zZXJ2ZXIgPSBzZXJ2ZXINCiAgICAgICAgc2VsZi5jbGllbnQgPSBjbGllbnQNCiAgICAgICAgc2VsZi5zZW5kX2luaXRpYWxpemUoKQ0KDQogICAgZGVmIGNsb3NlKHNlbGYpOg0KICAgICAgICAnJycNCiAgICAgICAgU2VuZCBzaHV0ZG93biB0byB0aGUgbGFuZ3VhZ2Ugc2VydmVyDQogICAgICAgICcnJw0KICAgICAgICBzZWxmLnNlbmRfc2h1dGRvd24oKQ0KICAgICAgICBzZWxmLmNsaWVudC5ub3RpZnkoJ2V4aXQnKQ=="
};

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
              ? Docstring(atob(this.props.docstring))
              : "docstring goes here"}
          </div>
        </CodeNode>

        {this.state.isHovering ? (
          <ExpandedCode
            codeBase64={this.props.codeSnippet}
            top={this.getTop()}
            startLine={this.props.lineNumber}
            filepath={this.props.filePath}
          />
        ) : null}
      </div>
    );
  }
}

export default class Definitions extends React.Component {
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

    if (isValidResult) {
      API.getDefinition(
        sessionId,
        hoverResult.fileSha,
        hoverResult.filePath,
        hoverResult.lineNumber,
        hoverResult.charNumber
      )
        .then(response => {
          console.log("response", response);
          const definition = {
            name: hoverResult.name,
            filePath: response.result.definition.location.path,
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
