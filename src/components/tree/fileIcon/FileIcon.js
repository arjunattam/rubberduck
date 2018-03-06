import React from "react";
import FileIcons from "./fileicon.lib";
import Octicon from "react-component-octicons";

export default class FileIcon extends React.Component {
  render() {
    let fileName = this.props.fileName;
    let iconClassName = FileIcons.getClassWithColor(fileName);
    let iconStyle = {
      fontStyle: "normal",
      display: "inline-block",
      marginRight: "3px",
      textDecoration: "none",
      height: "24px",
      width: "24px",
      textAlign: "center"
    };
    if (iconClassName) {
      return <i className={iconClassName} style={iconStyle} />;
    } else {
      return (
        <Octicon
          name="file"
          style={{ height: 15, color: "#999", marginRight: "3px" }}
        />
      );
    }
  }
}
