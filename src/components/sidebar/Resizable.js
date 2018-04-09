import React from "react";
import Rnd from "react-rnd";

const resizability = {
  top: false,
  right: true,
  bottom: false,
  left: false,
  topRight: false,
  bottomRight: false,
  bottomLeft: false,
  topLeft: false
};

const Resizable = props => (
  <Rnd
    {...props}
    size={{ width: props.width }}
    style={{ position: "fixed" }}
    disableDragging={true}
    enableResizing={resizability}
    className="sidebar-container will-slide-right"
  />
);

export default Resizable;
