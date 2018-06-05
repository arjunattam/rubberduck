import React from "react";

export const NewTabLink = ({ label, link }) => (
  <a href={link} target="_blank" rel="noopener noreferrer">
    {label} ↗
  </a>
);
