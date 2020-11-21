import React from 'react';

import checkFilter from '../checkFilter';
import { filterItem } from '../items/itemsFilters';
import getFilterControl from '../../components/UI/FilterMenu/getFilterControl';
import { getItemsFiltersControls } from '../items/itemsFilters';
import { getItemsFiltersDefaults } from "../items/itemsFilters"
import statusOptions from '../../components/userItems/statusOptions';
import { applyCustomFilter as applyCustomFilterOnitem } from '../items/itemsFilters';

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
    { getFilterControl('rating', 'Rating', handleFilterChange) }
  </div>
);

export const getUserItemsFilterDefaults = () => { return {
  ...getItemsFiltersDefaults(),
  inCollection: '',
  status: '',
  rating: 0
}}

export const filterUserItem = (userItem, filters) => {
  if (!filterItem(userItem.item, filters)) return false;
  if (!checkFilter('Select', userItem.inCollection.toString(), filters.inCollection)) return false;
  if (!checkFilter('Select', userItem.status, filters.status)) return false;
  if (filters.rating > 0 && !checkFilter('Number', userItem.rating || 0, filters.rating)) return false;
  return true;
};

export const applyCustomFilter = (filters, sort, customFilter) => {
  applyCustomFilterOnitem(filters, sort, customFilter);
}