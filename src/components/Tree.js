import React from "react";
import { getFilesTree } from "./../utils/api";
import { getChildren } from "./../utils/adapters";

class Folder extends React.Component {
  state = {
    isCollapsed: true
  };

  getPadding = () => {
    // function of depth
    return this.props.depth * 12;
  };

  toggleCollapsed = () => {
    this.setState({ isCollapsed: !this.state.isCollapsed });
  };

  render() {
    const pl = this.getPadding();
    if (this.state.isCollapsed) {
      return (
        <div style={{ marginTop: "6px" }} key={this.props.name}>
          <a
            href="#"
            onClick={this.toggleCollapsed}
            style={{ paddingLeft: pl, fontFamily: "Consolas" }}
          >
            +
          </a>{" "}
          <a href="#">{this.props.name}</a>
        </div>
      );
    } else {
      const children = this.props.children
        .sort(function(a, b) {
          return a.name > b.name;
        })
        .sort(function(a, b) {
          return a.children.length == 0;
        });
      console.log(this.props);
      return (
        <div style={{ marginTop: "6px" }} key={this.props.name}>
          <a
            href="#"
            onClick={this.toggleCollapsed}
            style={{ paddingLeft: pl, fontFamily: "monospace" }}
          >
            -
          </a>{" "}
          <a href="#">{this.props.name}</a>
          {children.map(element => {
            if (element.children.length > 0) {
              return <Folder {...element} depth={this.props.depth + 1} />;
            } else {
              return <File {...element} depth={this.props.depth + 1} />;
            }
          })}
        </div>
      );
    }
  }
}

class File extends React.Component {
  getPadding = () => {
    // function of depth
    return (this.props.depth + 1) * 12;
  };

  render() {
    const pl = this.getPadding();
    return (
      <div style={{ marginTop: "6px" }} key={this.props.name}>
        <a href="#" style={{ paddingLeft: pl }}>
          {this.props.name}
        </a>
      </div>
    );
  }
}

export default class Tree extends React.Component {
  state = {
    data: { children: [] }
  };

  componentDidUpdate(prevProps) {
    if (prevProps != this.props) {
      getFilesTree(this.props.username, this.props.reponame)
        .then(response => {
          this.setState({
            data: getChildren(this.props.reponame, response.data.tree)
          });
        })
        .catch(error => {
          console.log("Error in API call");
        });
    }
  }

  render() {
    // data is a recursive tree structure, where every element
    // has children, that denote the subtree
    const children = this.state.data.children
      .sort(function(a, b) {
        return a.name > b.name;
      })
      .sort(function(a, b) {
        return a.children.length == 0;
      });
    console.log(children);

    return (
      <div style={{ paddingLeft: "10px", overflow: "auto" }}>
        {children.map(element => {
          if (element.children.length > 0) {
            return <Folder {...element} depth={0} />;
          } else {
            return <File {...element} depth={0} />;
          }
        })}
      </div>
    );
  }
}
