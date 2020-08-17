import React from 'react';

import getFilterControl from '../../UI/FilterMenu/getFilterControl';
import getItemsFilterControls from '../../items/Items/getItemsFilterControls';
import statusOptions from '../statusOptions';

export default (extraParams) => (filters, handleFilterChange) => (
  <div>
    { getItemsFilterControls(extraParams)(filters, handleFilterChange) }
    { getFilterControl('inCollection', 'Select', handleFilterChange, {
      options: [{ text: 'In Collection', value: 'true' }, { text: 'Not In Collection', value: 'false' }]
    }) }
    {
      filters.type &&
      getFilterControl('status', 'Select', handleFilterChange, { options: statusOptions({ type: filters.type }) })
    }
  </div>
);