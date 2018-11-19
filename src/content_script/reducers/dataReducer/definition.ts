import { createReducer } from "redux-create-reducer";

export default createReducer(
  {},
  {
    CALL_DEFINITION_PENDING: (state, action: any) => {
      const { hoverResult } = action.meta;
      const definition = { name: hoverResult.name };
      return {
        ...definition
      };
    },
    CALL_DEFINITION_FULFILLED: (state, action: any) => {
      const { hoverResult } = action.meta;
      return {
        ...state,
        ...action.payload,
        // Overwriting name with hoverResult. TODO: clean up this mess.
        name: hoverResult.name
      };
    }
  }
);
