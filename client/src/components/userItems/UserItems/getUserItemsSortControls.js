import React from 'react';

import getItemsSortControls from '../../items/Items/getItemsSortControls';

export default (currentSort, currentFilters, handleSortChange) => 
  getItemsSortControls(currentSort, currentFilters, handleSortChange);