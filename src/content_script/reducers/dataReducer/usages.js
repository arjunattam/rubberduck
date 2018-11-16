import { createReducer } from "redux-create-reducer";
import { pathNearnessSorter } from "../../utils/data";

const getUsageObject = usage => ({
  lineNumber: usage.location.range.start.line,
  codeSnippet: usage.contents,
  startLineNumber: usage.contents_start_line
});

const getUsageItems = (apiResult, hoverResult) => {
  // Sort usages by line number
  let itemsObjects = apiResult.reduce((accumulator, usage) => {
    const { path } = usage.location;
    const obj = getUsageObject(usage);
    accumulator[path] =
      path in accumulator ? [obj, ...accumulator[path]] : [obj];
    return accumulator;
  }, {});

  Object.keys(itemsObjects).forEach(key => {
    itemsObjects[key].sort((x, y) => x.lineNumber - y.lineNumber);
  });

  const metadataObjects = apiResult.reduce((accumulator, usage) => {
    const { path: filePath } = usage.location;
    const { fileSha } = hoverResult;
    const obj = { filePath, fileSha };
    accumulator[filePath] = obj;
    return accumulator;
  }, {});

  const files = Object.keys(itemsObjects);
  const currentFilePath = hoverResult.filePath || "";
  files.sort((x, y) => pathNearnessSorter(x, y, currentFilePath));
  const items = files.map(file => {
    return {
      items: itemsObjects[file],
      ...metadataObjects[file]
    };
  });
  return items;
};

export default createReducer(
  {},
  {
    CALL_USAGES_PENDING: (state, action) => {
      const { hoverResult } = action.meta;
      return {
        name: hoverResult.name,
        items: [],
        count: undefined
      };
    },
    CALL_USAGES_FULFILLED: (state, action) => {
      const { result } = action.payload;
      const { hoverResult } = action.meta;
      return {
        name: hoverResult.name,
        count: result.count,
        items: getUsageItems(result.references, hoverResult)
      };
    }
  }
);
