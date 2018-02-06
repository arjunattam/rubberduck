const axios = require("axios");

export const encodeQueryData = data => {
  let ret = [];
  for (let d in data)
    ret.push(encodeURIComponent(d) + "=" + encodeURIComponent(data[d]));
  return ret.join("&");
};

export const getParameterByName = (name, url) => {
  name = name.replace(/[\[\]]/g, "\\$&");
  var regex = new RegExp("[?&]" + name + "(=([^&#]*)|&|#|$)"),
    results = regex.exec(url);
  if (!results) return null;
  if (!results[2]) return "";
  return decodeURIComponent(results[2].replace(/\+/g, " "));
};

export const getFilesTree = (username, reponame) => {
  const uri =
    "/repos/" + username + "/" + reponame + "/git/trees/master?recursive=1";
  return axios.get("https://api.github.com" + uri, {
    // TODO(arjun): replace this with the github token
    headers: { Authorization: "token 111ab37ff1337fc2ab25cc86c96f01981a8e7c4f" }
  });
};

export const getToken = code => {
  const uri = "https://github.com/login/oauth/access_token";
  return axios.post(uri, {
    client_id: "6e58defbed2f902a8429",
    client_secret: "b4eafefe8127ce9616af448a65cc83ba6a06a649",
    code: code
  });
};
