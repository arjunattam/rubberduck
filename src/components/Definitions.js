import React from "react";
import { getDocstringJSX } from "./Hover";
import SectionHeader from "./common/Section";
import SyntaxHighlighter from "react-syntax-highlighter";
import { githubGist as githubStyle } from "react-syntax-highlighter/styles/hljs";
import "./Definitions.css";

const definitionName = "PythonLSClient(BaseLSClient)";

const definitionDocstring =
  "Class that maintains the client and server lifecycle\n" +
  "for the language server. To use, use the `with` keyword\n" +
  "\n" +
  "with PythonLSClient() as pls:\n" +
  "    ...\n" +
  "\n" +
  "This will ensure that the client/server are shutdown\n" +
  "properly at the end of the execution.";

const codeSnippet =
  "DQpjbGFzcyBQeXRob25MU0NsaWVudChCYXNlTFNDbGllbnQpOg0KICAgICcnJw0KICAgIENsYXNzIHRoYXQgbWFpbnRhaW5zIHRoZSBjbGllbnQgYW5kIHNlcnZlciBsaWZlY3ljbGUNCiAgICBmb3IgdGhlIGxhbmd1YWdlIHNlcnZlci4gVG8gdXNlLCB1c2UgdGhlIGB3aXRoYCBrZXl3b3JkDQogICAgd2l0aCBQeXRob25MU0NsaWVudCgpIGFzIHBsczoNCiAgICAgICAgLi4uDQogICAgVGhpcyB3aWxsIGVuc3VyZSB0aGF0IHRoZSBjbGllbnQvc2VydmVyIGFyZSBzaHV0ZG93bg0KICAgIHByb3Blcmx5IGF0IHRoZSBlbmQgb2YgdGhlIGV4ZWN1dGlvbi4NCiAgICAnJycNCiAgICBMQU5HVUFHRV9JRCA9ICdweXRob24nDQogICAgRklMRV9FWFRFTlNJT04gPSAnLnB5Jw0KDQogICAgZGVmIF9faW5pdF9fKHNlbGYsIHByb2plY3RfcGF0aCk6DQogICAgICAgICcnJw0KICAgICAgICBTZXRzIHVwIHR3byB0aHJlYWRzLCBvbmUgZm9yIHRoZSBjbGllbnQsIGFuZCBvdGhlcg0KICAgICAgICBmb3IgdGhlIHNlcnZlci4gQWxzbyBzZXRzIHVwIHRoZSB1bml4IHNvY2tldHMgYmV0d2Vlbg0KICAgICAgICB0aGVzZSB0d28uDQogICAgICAgICcnJw0KICAgICAgICBzZWxmLlBST0pFQ1RfUEFUSCA9IHByb2plY3RfcGF0aA0KICAgICAgICBjc3IsIGNzdyA9IG9zLnBpcGUoKSAgIyBDbGllbnQgdG8gU2VydmVyIHBpcGUNCiAgICAgICAgc2NyLCBzY3cgPSBvcy5waXBlKCkgICMgU2VydmVyIHRvIENsaWVudCBwaXBlDQogICAgICAgIHNlcnZlciA9IFRocmVhZCh0YXJnZXQ9c3RhcnRfaW9fbGFuZ19zZXJ2ZXIsIGFyZ3M9KA0KICAgICAgICAgICAgb3MuZmRvcGVuKGNzciwgJ3JiJyksIG9zLmZkb3BlbihzY3csICd3YicpLCBQeXRob25MYW5ndWFnZVNlcnZlcg0KICAgICAgICApKQ0KICAgICAgICBzZXJ2ZXIuZGFlbW9uID0gVHJ1ZQ0KICAgICAgICBzZXJ2ZXIuc3RhcnQoKQ0KICAgICAgICBjbGllbnQgPSBKU09OUlBDQ2xpZW50KG9zLmZkb3BlbihzY3IsICdyYicpLCBvcy5mZG9wZW4oY3N3LCAnd2InKSkNCiAgICAgICAgc2VsZi5zZXJ2ZXIgPSBzZXJ2ZXINCiAgICAgICAgc2VsZi5jbGllbnQgPSBjbGllbnQNCiAgICAgICAgc2VsZi5zZW5kX2luaXRpYWxpemUoKQ0KDQogICAgZGVmIGNsb3NlKHNlbGYpOg0KICAgICAgICAnJycNCiAgICAgICAgU2VuZCBzaHV0ZG93biB0byB0aGUgbGFuZ3VhZ2Ugc2VydmVyDQogICAgICAgICcnJw0KICAgICAgICBzZWxmLnNlbmRfc2h1dGRvd24oKQ0KICAgICAgICBzZWxmLmNsaWVudC5ub3RpZnkoJ2V4aXQnKQ==";

class ExpandedDefinition extends React.Component {
  render() {
    return (
      <div className="expanded-definition" style={{ top: this.props.top }}>
        <div className="expanded-title">
          <div className="expanded-filepath">{this.props.filepath}</div>
          <div className="expanded-button">
            <a href={this.props.filepath} target="_blank">
              Open file ↗
            </a>
          </div>
        </div>
        <div className="expanded-code">
          <SyntaxHighlighter
            language={this.props.language}
            style={githubStyle}
            showLineNumbers={true}
            startingLineNumber={this.props.startLine}
            lineNumberStyle={{ color: "rgba(27,31,35,0.3)" }}
          >
            {atob(this.props.codeBase64)}
          </SyntaxHighlighter>
        </div>
      </div>
    );
  }
}

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
    return this.refs.container.getBoundingClientRect().top - 4;
  };

  render() {
    return (
      <div
        className="definition-item"
        onMouseEnter={this.handleMouseHover}
        onMouseLeave={this.handleMouseHover}
        ref={"container"}
      >
        <div className="definition-name monospace">{definitionName}</div>
        <div className="definition-docstring">
          {getDocstringJSX(definitionDocstring)}
        </div>
        <div className="definition-filepath">{"apps/ls_clients/python.py"}</div>

        {this.state.isHovering ? (
          <ExpandedDefinition
            codeBase64={codeSnippet}
            top={this.getTop()}
            startLine={25}
            filepath={"apps/ls_clients/python.py"}
          />
        ) : null}
      </div>
    );
  }
}

export default class Definitions extends React.Component {
  state = {
    isVisible: true
  };

  toggleVisibility = () => {
    this.setState({
      isVisible: !this.state.isVisible
    });
  };

  render() {
    return (
      <div className="definitions-section">
        <SectionHeader
          onClick={this.toggleVisibility}
          isVisible={this.state.isVisible}
          name={"Definitions"}
        />
        {this.state.isVisible ? <DefinitionItem /> : null}
      </div>
    );
  }
}
