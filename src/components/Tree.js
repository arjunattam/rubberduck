import React from "react";
import { getFilesTree } from "./../utils/api";

export default class Tree extends React.Component {
  state = {
    data: []
  };

  componentDidUpdate() {
    getFilesTree(this.props.username, this.props.reponame)
      .then(response => {
        this.setState({
          data: response.data.tree
        });
      })
      .catch(error => {
        console.log("Error in API call");
      });
  }

  render() {
    return (
      <div style={{ paddingLeft: "10px", overflow: "auto" }}>
        {this.state.data.map(element => {
          return (
            <div style={{ marginTop: "6px" }} key={element.path}>
              <a href="#">{element.path}</a>
            </div>
          );
        })}
      </div>
    );
  }
}
