import * as React from "react";
import { BaseSection, CustomButton } from "./base";

const NPM_LINK = "https://www.npmjs.com/package/rubberduck-native";

export const NativeAppSection = ({
  isConnected,
  currentVersion,
  latestVersion
}) => {
  let text = `Native host is connected and up to date (version ${currentVersion})`;
  let alertClass = `alert-success`;
  const isUpdateAvailable =
    !!currentVersion && !!latestVersion && currentVersion !== latestVersion;

  if (!isConnected) {
    alertClass = `alert-danger`;
    text = `Native host is not available`;
  } else {
    if (isUpdateAvailable) {
      alertClass = `alert-warning`;
      text = `Native host is connected, and update is available (available: ${latestVersion}, installed: ${currentVersion})`;
    }
  }

  return (
    <BaseSection title={"Native host"}>
      <div className={`alert ${alertClass}`}>{text}</div>
      <CustomButton onClick={() => window.open(NPM_LINK)}>
        Setup native host
      </CustomButton>
    </BaseSection>
  );
};
