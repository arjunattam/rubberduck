export const isTreeTooBig = () => {
  const ACCEPTABLE_TREE_COVERAGE = 0.55;
  const treeElement = document.querySelector("div.tree-content");
  const sidebarElement = document.querySelector("div.sidebar-container");
  if (treeElement && sidebarElement) {
    const treeCoverage = treeElement.offsetHeight / sidebarElement.offsetHeight;
    return treeCoverage >= ACCEPTABLE_TREE_COVERAGE;
  }
  return false;
};
