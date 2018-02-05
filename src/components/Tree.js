import React from "react";
import { getFilesTree } from "./../utils/api";

export default class Tree extends React.Component {
  state = {
    data: []
  };

  componentDidMount() {
    getFilesTree().then(response => {
      console.log(response);
      this.setState({
        data: response.data.tree
      });
    });
  }

  render() {
    return (
      <div style={{ paddingLeft: "10px", overflow: "auto" }}>
        {this.state.data.map(element => {
          return (
            <div style={{ marginTop: "6px" }}>
              <a href="#">{element.path}</a>
            </div>
          );
        })}
      </div>
    );
  }
}
