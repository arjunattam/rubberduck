import { sendMessageToAllTabs } from "./utils";

export const onStorageChanged = (changes, namespace) => {
  let storageChanges = {};
  const keys = Object.keys(changes);

  keys.forEach(key => {
    let storageChange = changes[key];
    storageChanges = {
      ...storageChanges,
      [key]: storageChange.newValue
    };
  });

  sendMessageToAllTabs("STORAGE_UPDATED", storageChanges);
};
