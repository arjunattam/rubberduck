import React from "react";
import { getDocstringJSX } from "./Hover";
import SectionHeader from "./common/Section";
import ExpandedCode from "./common/ExpandedCode";
import CodeNode from "./common/CodeNode";
import "./Definitions.css";

const definitionName = "PythonLSClient";
const baseName = "BaseLSClient";
const filepath = "apps/ls_clients/python.py";

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
        <CodeNode name={definitionName} file={filepath}>
          <div className="definition-docstring">
            {getDocstringJSX(definitionDocstring)}
          </div>
        </CodeNode>

        {this.state.isHovering ? (
          <ExpandedCode
            codeBase64={codeSnippet}
            top={this.getTop()}
            startLine={25}
            filepath={filepath}
          />
        ) : null}
      </div>
    );
  }
}

export default class Definitions extends React.Component {
  state = {
    isVisible: false
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
