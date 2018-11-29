import * as React from "react";
import ReactJson from "react-json-view";

export class InfoSection extends React.Component<any, {}> {
  render() {
    return (
      <div>
        <h2>Info</h2>
        <ReactJson
          style={{ fontSize: 16 }}
          src={this.props.data}
          name={false}
          enableClipboard={false}
          displayDataTypes={false}
        />
      </div>
    );
  }
}
