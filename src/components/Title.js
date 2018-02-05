import React from "react";
import "./Title.css";

export default class Title extends React.Component {
  render() {
    return (
      <div className="header">
        <p>
          <a href="#">organisation</a> / <a href="#">repository</a>
        </p>
        <p>master</p>
      </div>
    );
  }
}
