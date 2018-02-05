const axios = require("axios");

export const getFilesTree = (username, reponame) => {
  const uri =
    "/repos/" + username + "/" + reponame + "/git/trees/master?recursive=1";
  return axios.get("https://api.github.com" + uri);
};
