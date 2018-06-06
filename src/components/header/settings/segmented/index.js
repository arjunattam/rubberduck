import React from "react";
import Octicon from "react-component-octicons";
import "./index.css";

const SegmentInput = ({ value, name, icon, isChecked, onChange }) => {
  const elementId = `option-${value}`;
  return (
    <li className="segmented-control__item">
      <input
        className="segmented-control__input"
        type="radio"
        value={value}
        name="option"
        id={elementId}
        checked={isChecked}
        onChange={onChange}
      />
      <label className="segmented-control__label" htmlFor={elementId}>
        {name} <Octicon name={icon} />
      </label>
    </li>
  );
};

// From https://github.com/springload/segmented-control
const SegmentControl = props => {
  const { hasMenuApp, onChange } = props;
  const onInputChange = event => onChange(event.target.value === "1");
  return (
    <ul className="segmented-control">
      <SegmentInput
        value="1"
        name="Self-hosted"
        icon="shield"
        isChecked={hasMenuApp}
        onChange={onInputChange}
      />
      <SegmentInput
        value="2"
        name="Basic"
        icon="server"
        isChecked={!hasMenuApp}
        onChange={onInputChange}
      />
    </ul>
  );
};

export default SegmentControl;
