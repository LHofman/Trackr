import React from 'react';

import checkFilter from '../../../utils/checkFilter';
import { filterItem } from '../../items/Items/itemsFilters';
import getFilterControl from '../../UI/FilterMenu/getFilterControl';
import { getItemsFiltersControls } from '../../items/Items/itemsFilters';
import { getItemsFiltersDefaults } from "../../items/Items/itemsFilters"
import statusOptions from '../statusOptions';

export const getUserItemsFilterControls = (extraParams) => (filters, handleFilterChange) => (
  <div>
    { getItemsFiltersControls(extraParams)(filters, handleFilterChange) }
    { getFilterControl('inCollection', 'Select', handleFilterChange, {
      options: [{ text: 'In Collection', value: 'true' }, { text: 'Not In Collection', value: 'false' }]
    }) }
    {
      filters.type &&
      getFilterControl('status', 'Select', handleFilterChange, { options: statusOptions({ type: filters.type }) })
    }
  </div>
);

export const getUserItemsFilterDefaults = () => { return {
  ...getItemsFiltersDefaults(),
  inCollection: '',
  status: ''
}}

export const filterUserItem = (userItem, filters) => {
  if (!filterItem(userItem.item, filters)) return false;
  if (!checkFilter('Select', userItem.inCollection.toString(), filters.inCollection)) return false;
  if (!checkFilter('Select', userItem.status, filters.status)) return false;
  return true;
};