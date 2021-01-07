import { getFranchisesFiltersDefaults } from '../../components/franchises/Franchises/franchisesFilters';
import { getItemsFiltersDefaults } from '../../utils/items/itemsFilters';
import { franchisesSortDefault } from '../../components/franchises/Franchises/franchisesSorting';
import { itemsSortDefault, } from '../../utils/items/itemsSorting';

import * as actionTypes from './actions';
import * as stateKeys from './keys';

const initialState = {
  [stateKeys.LIST_FILTERS]: getFranchisesFiltersDefaults(),
  [stateKeys.LIST_SORTING]: franchisesSortDefault,
  [stateKeys.LIST_PAGE]: 1,
  [stateKeys.ITEMS_LIST_FILTERS]: getItemsFiltersDefaults(),
  [stateKeys.ITEMS_LIST_SORTING]: itemsSortDefault,
  [stateKeys.ITEMS_LIST_PAGE]: 1
};

export default (state = initialState, action) => {
  switch (action.type) {
    case actionTypes.SET_FRANCHISES_LIST_FILTERS: return { ...state, [stateKeys.LIST_FILTERS]: action.payload };
    case actionTypes.SET_FRANCHISES_LIST_SORTING: return { ...state, [stateKeys.LIST_SORTING]: action.payload };
    case actionTypes.SET_FRANCHISES_LIST_PAGE: return { ...state, [stateKeys.LIST_PAGE]: action.payload };
    case actionTypes.SET_FRANCHISES_ITEMS_LIST_FILTERS: return { ...state, [stateKeys.ITEMS_LIST_FILTERS]: action.payload };
    case actionTypes.SET_FRANCHISES_ITEMS_LIST_SORTING: return { ...state, [stateKeys.ITEMS_LIST_SORTING]: action.payload };
    case actionTypes.SET_FRANCHISES_ITEMS_LIST_PAGE: return { ...state, [stateKeys.ITEMS_LIST_PAGE]: action.payload };
    default: return state;
  }
}
