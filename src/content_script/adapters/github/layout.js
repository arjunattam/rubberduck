const GH_CONTAINER_CLASS = "container";

const SPACING = 10;

/**
 * Get elements and then merge-flatten them
 */
const getContainerElements = () => [
  ...document.getElementsByClassName(GH_CONTAINER_CLASS)
];

const getContainerWidth = () => {
  const containerElements = getContainerElements();
  return containerElements.reduce((max, b) => {
    return b.offsetWidth ? Math.max(max, b.offsetWidth) : max;
  }, 0);
};

const updateContainerWidths = width => {
  const containerElements = getContainerElements();
  containerElements.forEach(element => (element.style.width = `${width}px`));
};

/**
 * This method updates the layout of the page to fit the sidebar
 */
export const updateLayout = (isExpanded, sidebarWidth) => {
  const documentWidth = document.body.offsetWidth;
  const windowWidth = window.innerWidth;
  const containerWidth = getContainerWidth();

  const autoMarginLeft = (documentWidth - containerWidth) / 2;
  const spacing = containerWidth < 1000 ? SPACING : 0;
  const shouldPushLeft = isExpanded && autoMarginLeft < sidebarWidth + spacing;
  const shouldResizeContainer =
    isExpanded && windowWidth < containerWidth + sidebarWidth;

  document.body.style.marginLeft = shouldPushLeft ? sidebarWidth + "px" : "";

  if (shouldResizeContainer) {
    // TODO(arjun): the goal is to not have horizontal scrolling in this case
    // calculate the max container width and call updateContainerWidths()
  }
};
