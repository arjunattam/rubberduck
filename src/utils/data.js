import { Base64 } from "js-base64";

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
      path: "",
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

const sumOfKey = (children, key) => {
  let sum = 0;
  for (var index = 0; index < children.length; index++) {
    sum += children[index][key];
  }
  return sum;
};

const appendDiffInfo = (tree, prResponse) => {
  for (var index = 0; index < tree.length; index++) {
    const element = tree[index];

    if (element.children.length === 0) {
      // We find this in the prResponse
      const prFile = prResponse.find(x => x.filename === element.path);
      tree[index].additions = prFile.additions;
      tree[index].deletions = prFile.deletions;
    } else {
      // Need to sum up from children
      tree[index].children = appendDiffInfo(tree[index].children, prResponse);
      tree[index].additions = sumOfKey(tree[index].children, "additions");
      tree[index].deletions = sumOfKey(tree[index].children, "deletions");
    }
  }

  return tree;
};

export const getPRChildren = (reponame, fileList) => {
  // fileList is a list of files that have been changed in the PR
  const filenames = fileList.map(element => {
    return element.filename;
  });
  let result = {
    name: reponame,
    path: "",
    children: fillPaths(buildTree(filenames), "")
  };
  return appendDiffInfo([result], fileList)[0];
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

export const encodeToBase64 = string => {
  return Base64.encode(string);
};

export const decodeBase64 = string => {
  return Base64.decode(string);
};

export const flattenChildren = tree => {
  if (tree.children.length === 0 || tree.children.length > 1) {
    let newTree = {};
    newTree.name = tree.name;
    newTree.path = tree.path;
    newTree.children = tree.children.map(element => {
      return flattenChildren(element);
    });
    return newTree;
  } else {
    // There is only one child. If this child has >=1 children,
    // it is a folder, and we can flatten it at this level.
    let flattened = {};
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
