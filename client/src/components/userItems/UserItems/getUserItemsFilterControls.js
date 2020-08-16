import React from 'react';

import getFilterControl from '../../UI/FilterMenu/getFilterControl';
import getItemsFilterControls from '../../items/Items/getItemsFilterControls';
import statusOptions from '../statusOptions';

export default (filters, handleFilterChange, extraParams = {}) => (
  <div>
    {getItemsFilterControls(filters, handleFilterChange, extraParams)}
    {getFilterControl('inCollection', 'Select', handleFilterChange, {
      options: [{ text: 'In Collection', value: 'true' }, { text: 'Not In Collection', value: 'false' }]
    })}
    {getFilterControl('status', 'Select', handleFilterChange, { options: statusOptions({ type: filters.type }) })}
  </div>
);