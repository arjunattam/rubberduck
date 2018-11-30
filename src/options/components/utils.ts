export const getLatestVersion = async () => {
  const response = await fetch(
    "https://api.npms.io/v2/package/rubberduck-native"
  );
  const json = await response.json();
  return json.collected.metadata.version;
};
