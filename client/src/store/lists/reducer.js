import { getListsFiltersDefaults } from '../../components/lists/Lists/listsFilters';
import { getItemsFiltersDefaults } from '../../utils/items/itemsFilters';
import { listsSortDefault } from '../../components/lists/Lists/listsSorting';
import { itemsSortDefault, } from '../../utils/items/itemsSorting';

import * as actionTypes from './actions';
import * as stateKeys from './keys';

const initialState = {
  [stateKeys.LIST_FILTERS]: getListsFiltersDefaults(),
  [stateKeys.LIST_SORTING]: listsSortDefault,
  [stateKeys.LIST_PAGE]: 1,
  [stateKeys.ITEMS_LIST_FILTERS]: getItemsFiltersDefaults(),
  [stateKeys.ITEMS_LIST_SORTING]: itemsSortDefault,
  [stateKeys.ITEMS_LIST_PAGE]: 1
};

export default (state = initialState, action) => {
  switch (action.type) {
    case actionTypes.SET_LISTS_LIST_FILTERS: return { ...state, [stateKeys.LIST_FILTERS]: action.payload };
    case actionTypes.SET_LISTS_LIST_SORTING: return { ...state, [stateKeys.LIST_SORTING]: action.payload };
    case actionTypes.SET_LISTS_LIST_PAGE: return { ...state, [stateKeys.LIST_PAGE]: action.payload };
    case actionTypes.SET_LISTS_ITEMS_LIST_FILTERS: return { ...state, [stateKeys.ITEMS_LIST_FILTERS]: action.payload };
    case actionTypes.SET_LISTS_ITEMS_LIST_SORTING: return { ...state, [stateKeys.ITEMS_LIST_SORTING]: action.payload };
    case actionTypes.SET_LISTS_ITEMS_LIST_PAGE: return { ...state, [stateKeys.ITEMS_LIST_PAGE]: action.payload };
    default: return state;
  }
}
