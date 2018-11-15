import * as git from "isomorphic-git";
import * as BrowserFS from "browserfs";

import createClient = require("fs-remote/createClient");

export const init = () => {
  console.log("initializing git");
  const fs = createClient("http://localhost:3001");

  const r = fs.writeFileSync("test-file", "test-file");
  console.log(r);

  git.listFiles({ fs, dir: "" }).then(files => {
    console.log("res", files);
  });

  git
    .clone({
      fs: fs,
      dir: "test-repo",
      corsProxy: "https://cors.isomorphic-git.org",
      url: "https://github.com/karigari/really-large-repo",
      singleBranch: true,
      depth: 1
    })
    .then(r => {
      console.log("done", r);

      fs.readdir("test-repo", function(e, contents) {
        // etc.
        console.log(e);
        console.log(contents);
      });
    })
    .catch(e => console.log("error", e));
};
