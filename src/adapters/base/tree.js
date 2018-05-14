export const buildTree = fileList => {
  // Recursively method that takes in a list and returns the tree
  if (fileList.length === 0) {
    return [];
  }

  let hierarchy = {};
  for (var index = 0; index < fileList.length; index++) {
    const element = fileList[index];
    const currentLevelName = element.split("/")[0];

    if (!(currentLevelName in hierarchy)) {
      hierarchy[currentLevelName] = []; // key is not defined
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
      path: "",
      children: buildTree(hierarchy[levelName])
    });
  }

  return result;
};

export const fillPaths = (tree, parentPath) => {
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

const sumOfKey = (children, key) => {
  let sum = 0;
  for (var index = 0; index < children.length; index++) {
    sum += children[index][key];
  }
  return sum;
};

const returnIfSame = (children, key) => {
  // Return value of key if all children have the same value
  if (children.length === 1) {
    return children[0][key];
  }

  return children.reduce(function(result, child) {
    return result && child && result === child[key] ? result : null;
  }, children[0][key]);
};

export const appendDiffInfo = (tree, prResponse) => {
  for (var index = 0; index < tree.length; index++) {
    const element = tree[index];

    if (element.children.length === 0) {
      // We find this in the prResponse
      const prFile = prResponse.find(x => x.filename === element.path);
      tree[index].additions = prFile.additions;
      tree[index].deletions = prFile.deletions;
      tree[index].status = prFile.status;
    } else {
      // Need to sum up from children
      tree[index].children = appendDiffInfo(tree[index].children, prResponse);
      tree[index].additions = sumOfKey(tree[index].children, "additions");
      tree[index].deletions = sumOfKey(tree[index].children, "deletions");
      tree[index].status = returnIfSame(tree[index].children, "status");
    }
  }

  return tree;
};

export const getPRChildren = (reponame, response) => {
  // fileList is a list of files that have been changed in the PR
  const filenames = response.map(element => {
    return element.filename;
  });
  let result = {
    name: reponame,
    path: "",
    children: fillPaths(buildTree(filenames), "")
  };
  return appendDiffInfo([result], response)[0];
};

export const flattenChildren = tree => {
  const children = tree.children || [];
  if (children.length === 0 || children.length > 1 || tree.path === "") {
    let newTree = Object.assign({}, tree);

    if (children.length > 0) {
      newTree.children = tree.children.map(element => {
        return flattenChildren(element);
      });
    } else {
      newTree.children = [];
    }

    return newTree;
  } else {
    // There is only one child. If this child has >=1 children,
    // it is a folder, and we can flatten it at this level.
    let flattened = Object.assign({}, tree);
    const child = tree.children[0];

    if (child.children.length > 0) {
      flattened.name = tree.name + "/" + child.name;
      flattened.path = child.path;
      flattened.children = child.children;
      return flattenChildren(flattened);
    } else {
      // Child is a file
      return tree;
    }
  }
};
