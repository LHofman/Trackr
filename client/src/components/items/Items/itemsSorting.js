import React from 'react';

import { sort, sortValues } from '../../../utils/sortUtils';

import getSortControl from '../../UI/FilterMenu/getSortControl';

export const getItemsSortControls = (extraFields = []) => (currentSort, currentFilters, handleSortChange) => (
  <div>
    {
      extraFields.includes('index') &&
      getSortControl('index', currentSort, handleSortChange)
    }
    { getSortControl('title', currentSort, handleSortChange) }
    { getSortControl('releaseDate', currentSort, handleSortChange) }
    {
      currentFilters.type === 'Movie' &&
      getSortControl('releaseDateDvd', currentSort, handleSortChange)
    }
  </div>
);

export const itemsSortDefault = { field: 'title', order: 'asc' };

export const sortItems = ({ field, order }, filters = {}) => (item1, item2) => {
  return sort(
    { field, order },
    filters,
    (field, item1, item2) => {
      switch (field) {
        case 'index':
          return sortValues('Number', item1.index, item2.index);
        case 'releaseDate':
          return sortValues('Date', 
            { status: item1.releaseDateStatus, value: item1.releaseDate },
            { status: item2.releaseDateStatus, value: item2.releaseDate }
          );
        case 'releaseDateDvd':
          return sortValues('Date', 
            { status: item1.releaseDateDvdStatus, value: item1.releaseDateDvd },
            { status: item2.releaseDateDvdStatus, value: item2.releaseDateDvd }
          );
        default:
          return null;
      }
    }
  )(item1, item2);
}