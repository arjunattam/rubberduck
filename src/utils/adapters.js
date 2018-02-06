// This is a set of utils for the github implementation (github adapter). See octotree for more depth
// https://github.com/buunguyen/octotree/blob/master/src/adapters/github.js#L76

export const getRepoFromPath = () => {
  try {
    // (username)/(reponame)[/(type)][/(typeId)]
    const match = window.location.pathname.match(
      /([^\/]+)\/([^\/]+)(?:\/([^\/]+))?(?:\/([^\/]+))?/
    );
    return {
      username: match[1],
      reponame: match[2],
      type: match[3],
      typeId: match[4]
    };
  } catch (err) {
    console.log("getRepoFromPath crashed");
    return {};
  }
};

export const getChildren = (reponame, tree) => {
  // tree has objects of types `tree` and `blob`
  // this method converts this flat tree structure into
  // a proper nested tree.
  let result = {
    name: reponame,
    path: "",
    children: []
  };

  for (var i = 0; i < tree.length; i++) {
    let element = tree[i];
    let split = element.path.split("/");

    if (split.length === 1) {
      // This is a first-level child
      result.children.push({ name: split[0], children: [], path: split[0] });
    } else {
      // This will go deeper, so we will traverse the tree
      let subTreeElement = result.children;

      if (subTreeElement === undefined) {
        subTreeElement = [];
      }

      for (var j = 0; j < split.length; j++) {
        let subPath = split[j];

        if (j === split.length - 1) {
          // This is the last element, so add to tree
          subTreeElement.push({
            name: split[j],
            children: [],
            path: split.join("/")
          });
        } else {
          // This is a mid-level child, so need to locate
          // this in the tree_element, and find the sub-tree
          // where this file will eventually land
          let existingNames = [];
          for (var k = 0; k < subTreeElement.length; k++) {
            existingNames.push(subTreeElement[k]["name"]);
          }
          let index = existingNames.indexOf(subPath);
          subTreeElement = subTreeElement[index]["children"];
        }
      }
    }
  }

  return result;
};

export const constructPath = (subPath, orgname, reponame, typeId) => {
  // return relative path which follows a domain name, like
  // github.com, from given sub-path
  if (typeId == undefined) {
    typeId = "master";
  }

  return "/" + orgname + "/" + reponame + "/blob/" + typeId + "/" + subPath;
};
