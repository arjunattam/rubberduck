import { buildTree, fillPaths, appendDiffInfo } from "../base/tree";

export const getTreeChildren = (reponame, response) => {
  // response has directories and files
  const { directories, files } = response;
  const dirChildren = directories.map(element => ({
    name: element,
    path: element,
    children: [
      // TODO(arjun): remove dummy values
      {
        name: "dummy",
        path: "dummy",
        children: []
      }
    ]
  }));
  const filesChildren = files.map(element => ({
    name: element.path,
    path: element.path,
    children: []
  }));

  return {
    name: reponame,
    path: "",
    children: dirChildren.concat(filesChildren)
  };
};

export { getPRChildren, flattenChildren } from "../base/tree";
