import checkFilter from '../../../utils/checkFilter';

export const getListsFiltersDefaults = () => ({
  title: ''
});

export const filterList = (list, filters) => {
  if (!checkFilter('Text', list.title, filters.title)) return false;
  return true;
};