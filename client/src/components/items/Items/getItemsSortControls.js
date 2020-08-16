import React from 'react';

import getSortControl from '../../UI/FilterMenu/getSortControl';

export default (currentSort, currentFilters, handleSortChange) => (
  <div>
    { getSortControl('title', currentSort, handleSortChange) }
    { getSortControl('releaseDate', currentSort, handleSortChange) }
    {
      currentFilters.type === 'Movie' &&
      getSortControl('releaseDateDvd', currentSort, handleSortChange)
    }
  </div>
);