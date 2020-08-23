import React from 'react';

import getSortControl from '../../UI/FilterMenu/getSortControl';

export const getFranchisesSortControls = (currentSort, currentFilters, handleSortChange) => (
  <div>
    { getSortControl('title', currentSort, handleSortChange) }
  </div>
);

export const franchisesSortDefault = { field: 'title', order: 'asc' };
