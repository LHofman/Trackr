import React from 'react';

import getSortControl from '../../UI/FilterMenu/getSortControl';

export const getListsSortControls = (currentSort, currentFilters, handleSortChange) => (
  <div>
    { getSortControl('title', currentSort, handleSortChange) }
  </div>
);

export const listsSortDefault = { field: 'title', order: 'asc' };
