import { pathNearnessSorter } from "./data";

test("path nearness sorter works", () => {
  const INPUT_PATH = "b/c/d.js";
  const PATHS_TO_SORT = [
    "p/q.js",
    "a/b/c/e.js",
    "a/b/d.js",
    "b/c/e.js",
    "b/m.js"
  ];
  const EXPECTED_SORTING = ["b/c/e.js", "b/m.js"];
  PATHS_TO_SORT.sort((x, y) => pathNearnessSorter(x, y, INPUT_PATH));
  expect(PATHS_TO_SORT.slice(0, 2)).toEqual(EXPECTED_SORTING);
});
