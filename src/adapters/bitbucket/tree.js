export const getPRChildren = (reponame, response) => {
  // fileList is a list of files that have been changed in the PR
  //   const filenames = fileList.map(element => {
  //     return element.filename;
  //   });
  let result = {
    name: reponame,
    path: "",
    children: []
  };
  //   return appendDiffInfo([result], fileList)[0];
  return result;
};

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

export const flattenChildren = tree => {
  return tree;
};
