const axios = require("axios");

export const getFilesTree = () => {
  const uri =
    "/repos/googlemaps/google-maps-services-python/git/trees/master?recursive=1";
  return axios.get("https://api.github.com" + uri);
};
