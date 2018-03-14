// Github layout manipulation
const GH_CONTAINERS = ["container", "container-responsive"]; // class names for layout

const SPACING = 10;

export const updateLayout = (isSidebarVisible, width) => {
  // This method updates the layout of the page to fit the sidebar
  const documentWidth = document.body.offsetWidth;

  // Get elements and then merge-flatten them
  const containerElements = [].concat.apply(
    [],
    GH_CONTAINERS.map(name => {
      return [...document.getElementsByClassName(name)];
    })
  );
  let defaultWidth = 0;

  if (containerElements.length > 0) {
    defaultWidth = containerElements[0].offsetWidth;
  }

  const containerWidth = containerElements.reduce((max, b) => {
    if (b.offsetWidth !== undefined) {
      return Math.max(max, b.offsetWidth);
    } else {
      return defaultWidth;
    }
  }, defaultWidth);

  const autoMarginLeft = (documentWidth - containerWidth) / 2;
  const spacing = containerWidth < 1000 ? SPACING : 0;
  const shouldPushLeft = isSidebarVisible && autoMarginLeft < width + spacing;

  // Modifying page styles
  document.body.style.marginLeft = shouldPushLeft ? width + "px" : "";
  containerElements.forEach(element => {
    element.style.marginLeft = shouldPushLeft ? spacing + "px" : "";
  });
};
