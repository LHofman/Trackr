import { getUserItemsFilterDefaults } from '../../utils/userItems/userItemsFilters';
import { itemsSortDefault } from '../../utils/items/itemsSorting';

import * as actionTypes from './actions';
import * as stateKeys from './keys';

const initialState = {
  [stateKeys.LIST_FILTERS]: getUserItemsFilterDefaults(),
  [stateKeys.LIST_SORTING]: itemsSortDefault,
  [stateKeys.LIST_PAGE]: 1
};

export default (state = initialState, action) => {
  switch (action.type) {
    case actionTypes.SET_USERITEMS_LIST_FILTERS: return { ...state, [stateKeys.LIST_FILTERS]: action.payload };
    case actionTypes.SET_USERITEMS_LIST_SORTING: return { ...state, [stateKeys.LIST_SORTING]: action.payload };
    case actionTypes.SET_USERITEMS_LIST_PAGE: return { ...state, [stateKeys.LIST_PAGE]: action.payload };
    default: return state;
  }
}
