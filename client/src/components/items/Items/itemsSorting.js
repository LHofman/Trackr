import React from 'react';

import getSortControl from '../../UI/FilterMenu/getSortControl';
import sort from '../../../utils/sort';

export const getItemsSortControls = (currentSort, currentFilters, handleSortChange) => (
  <div>
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
  if (filters.title) {
    const item1HasExactTitle = item1.title.toLowerCase() === filters.title.toLowerCase();
    const item2HasExactTitle = item2.title.toLowerCase() === filters.title.toLowerCase();

    if (item1HasExactTitle && !item2HasExactTitle) return -1;
    if (!item1HasExactTitle && item2HasExactTitle) return 1;
  }

  const asc = order === 'asc' ? -1 : 1;

  let sortValue = 0;
  switch (field) {
    case 'releaseDate': sortValue = sort('Date', 
        { status: item1.releaseDateStatus, value: item1.releaseDate },
        { status: item2.releaseDateStatus, value: item2.releaseDate }
      ); break;
    case 'releaseDateDvd': sortValue = sort('Date', 
        { status: item1.releaseDateDvdStatus, value: item1.releaseDateDvd },
        { status: item2.releaseDateDvdStatus, value: item2.releaseDateDvd }
      ); break;
    default: sortValue = sort('', item1[field], item2[field]);
  }
  
  if (sortValue === 0) {
    sortValue = sort('', item1.title, item2.title) * 2;
  }
  
  //If sortValue is larger than 1 or smaller than -1, skip the order
  if (Math.abs(sortValue) > 1) {
    return sortValue / Math.abs(sortValue);
  }

  return sortValue < 1 ? asc : asc * -1;
}