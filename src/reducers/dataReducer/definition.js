import { createReducer } from "redux-create-reducer";

const initialState = {};

const getFilePath = result =>
  result.definition && result.definition.location
    ? result.definition.location.path
    : "";

const getStartLine = result =>
  result.definition ? result.definition.contents_start_line : null;

const getLine = result =>
  result.definition && result.definition.location
    ? result.definition.location.range.start.line
    : null;

const getDefinitionObject = (apiResult, hoverResult) => {
  const { fileSha } = hoverResult;
  const { definition, docstring } = apiResult;
  const filePath = getFilePath(apiResult);
  const lineNumber = getLine(apiResult);
  const startLineNumber = getStartLine(apiResult);
  const codeSnippet = definition ? definition.contents : "";
  const innerItem = { codeSnippet, lineNumber, startLineNumber };
  return {
    name: apiResult.name || hoverResult.name,
    filePath,
    fileSha,
    docstring,
    items: [innerItem]
  };
};

export default createReducer(initialState, {
  CALL_DEFINITIONS_PENDING: (state, action) => {
    const { hoverResult } = action.meta;
    const definition = { name: hoverResult.name };
    return {
      ...definition
    };
  },
  CALL_DEFINITIONS_FULFILLED: (state, action) => {
    const { result } = action.payload;
    const { hoverResult } = action.meta;
    const definition = getDefinitionObject(result, hoverResult);
    return {
      ...state,
      ...definition
    };
  }
});
