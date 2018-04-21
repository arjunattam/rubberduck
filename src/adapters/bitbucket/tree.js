import { buildTree, fillPaths } from "../base/tree";

export const getTreeChildren = (reponame, response) => {
  // response has directories and files
  const { values } = response || { values: [] };
  const filenames = values.map(element => {
    return element.path;
  });
  return {
    name: reponame,
    path: "",
    children: fillPaths(buildTree(filenames), "")
  };
};

export { getPRChildren, flattenChildren } from "../base/tree";
