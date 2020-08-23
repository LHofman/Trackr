import checkFilter from '../../../utils/checkFilter';

export const getFranchisesFiltersDefaults = () => ({
  title: ''
});

export const filterFranchise = (item, filters) => {
  if (!checkFilter('Text', item.title, filters.title)) return false;
  return true;
};