import * as React from "react";

const HELP_LINK =
  "https://github.com/karigari/rubberduck/tree/master/native-host#rubberduck-native-host";

export const NativeAppSection = ({
  isConnected,
  currentVersion,
  latestVersion
}) => {
  const connectedText = isConnected ? "connected" : "disconnected";
  return (
    <div>
      <h2>Native host</h2>
      <div>{connectedText}</div>
      <a href={HELP_LINK} target="_blank">
        Setup native host
      </a>
      <div>Current version: {currentVersion}</div>
      <div>Latest version: {latestVersion}</div>
    </div>
  );
};
