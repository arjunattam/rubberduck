import { createReducer } from "redux-create-reducer";
import { pathNearnessSorter } from "../../utils/data";

export default createReducer(
  {},
  {
    CALL_USAGES_PENDING: (state, action: any) => {
      const { hoverResult } = action.meta;
      return {
        name: hoverResult.name,
        items: [],
        count: undefined
      };
    },
    CALL_USAGES_FULFILLED: (state, action: any) => {
      const { hoverResult } = action.meta;
      const items = action.payload;
      const count = items.reduce((total, current) => {
        return total + current.items.length;
      }, 0);

      // TODO: Use path nearness sorter to sort items
      return {
        name: hoverResult.name,
        count,
        items
      };
    }
  }
);
