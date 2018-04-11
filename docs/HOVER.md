# Hover

Hover is a critical piece of the product as it initiates all other actions, and it is also tricky because it reads the HTML DOM. There are a few cases that need to be manually verified while making hover changes.

## Situations

1.  Hover fills up the code box elements with `span` elements, so that the text can be highlighted and detection and positioning is more accurate. This has some edge cases:

    * In compare views, when the code box is expanded to show non-diff portions, the fill span should get applied automatically.

    * Code box elements that are filled get assigned a specific class name. These elements are then not considered for following updates. In cases where new subtree elements appear (like in previous case), this has to be removed.

    * The darker git diff areas have special handling - they also need to be checked.

    * This can have some performance improvements. How/what to measure will be a good starting point.

    * When the window url changes (through pjax), this should get automatically applied.

2.  Github has two compare views -- unified and split
