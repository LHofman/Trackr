import React, { Fragment } from 'react';

import { getItemsSortControls, sortItems } from '../items/itemsSorting';
import getSortControl from '../../components/UI/FilterMenu/getSortControl';
import { sort, sortValuesStandard } from '../sortUtils';

export const getUserItemsSortControls = (extraFields = []) => (currentSort, currentFilters, handleSortChange) => (
  <Fragment>
    { getItemsSortControls(extraFields)(currentSort, currentFilters, handleSortChange) }
    { getSortControl('rating', currentSort, handleSortChange) }
  </Fragment>
);

export const sortUserItems = ({ field, order }, filters = {}) => (userItem1, userItem2) => {
  switch (field) {
    case 'rating': 
      return sort({ field, order }, filters, (field, userItem1, userItem2) => {
        switch (field) {
          case 'rating':
            return sortValuesStandard(userItem1.rating, userItem2.rating);
          default:
            return null;
        }
      })(userItem1, userItem2)
    default: return sortItems({ field, order }, filters)(userItem1.item, userItem2.item);
  }
}