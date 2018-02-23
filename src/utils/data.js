// Utilities to convert data formats
const buildTree = fileList => {
  // Recursively method that takes in a list and returns the tree
  if (fileList.length === 0) {
    return [];
  }

  let hierarchy = {};
  for (var index = 0; index < fileList.length; index++) {
    const element = fileList[index];
    const currentLevelName = element.split("/")[0];

    if (!(currentLevelName in hierarchy)) {
      // key is not defined
      hierarchy[currentLevelName] = [];
    }

    const spliced = element.split("/").splice(1);

    if (spliced.length > 0) {
      hierarchy[currentLevelName].push(spliced.join("/"));
    }
  }

  let result = [];
  for (var levelName in hierarchy) {
    result.push({
      name: levelName,
      path: "", // TODO(arjun): fill in a path
      children: buildTree(hierarchy[levelName])
    });
  }

  return result;
};

const fillPaths = (tree, parentPath) => {
  // Do DFS on the tree and fill up paths along the way
  for (var index = 0; index < tree.length; index++) {
    if (parentPath !== "") {
      tree[index].path = `${parentPath}/${tree[index].name}`;
    } else {
      tree[index].path = `${tree[index].name}`;
    }

    tree[index].children = fillPaths(tree[index].children, tree[index].path);
  }

  return tree;
};

export const getPRChildren = (reponame, fileList) => {
  // fileList is a list of files that have been changed in the PR
  const filenames = fileList.map(element => {
    return element.filename;
  });
  return {
    name: reponame,
    path: "",
    children: fillPaths(buildTree(filenames), "")
  };
};

export const getTreeChildren = (reponame, tree) => {
  const filenames = tree.map(element => {
    return element.path;
  });
  return {
    name: reponame,
    path: "",
    children: fillPaths(buildTree(filenames), "")
  };
};
