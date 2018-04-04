import React from "react";
// import FileIcons from "./fileicon.lib";
import Octicon from "react-component-octicons";

export default class FileIcon extends React.Component {
  // Turn off the random icons for now
  render() {
    // let fileName = this.props.fileName;
    // let iconClassName = FileIcons.getClassWithColor(fileName);
    // let iconStyle = {
    //   fontStyle: "normal",
    //   display: "inline-block",
    //   marginRight: "3px",
    //   textDecoration: "none",
    //   height: "24px",
    //   width: "24px",
    //   textAlign: "center"
    // };

    // if (iconClassName && this.props.octicon !== "file-directory") {
    //   return <i className={iconClassName} style={iconStyle} />;
    // } else {

    let octIconStyle = {
      verticalAlign: "text-bottom",
      marginRight: "3px",
      paddingLeft: "5px",
      paddingRight: "5px",
      height: 15,
      color: this.props.octColor
    };
    return <Octicon name={this.props.octicon} style={octIconStyle} />;

    // }
  }
}
