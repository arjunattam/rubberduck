const axios = require("axios");

export const getFilesTree = (username, reponame) => {
  const uri =
    "/repos/" + username + "/" + reponame + "/git/trees/master?recursive=1";
  return axios.get("https://api.github.com" + uri, {
    headers: { Authorization: "token 111ab37ff1337fc2ab25cc86c96f01981a8e7c4f" }
  });
};
