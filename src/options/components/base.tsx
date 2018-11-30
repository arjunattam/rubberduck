import * as React from "react";

export const BaseSection = ({ title, children }) => {
  return (
    <div className="my-4 p-4 bg-white border">
      <h4 className="mb-3">{title}</h4>
      <div>{children}</div>
    </div>
  );
};

export const CustomButton = ({ onClick, children }) => {
  return (
    <button
      type="button"
      className="btn btn-outline-primary mx-1"
      onClick={onClick}
    >
      {children}
    </button>
  );
};
