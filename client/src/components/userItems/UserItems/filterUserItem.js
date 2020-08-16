import checkFilter from '../../../utils/checkFilter';
import filterItem from '../../items/Items/filterItem';

export default (userItem, filters) => {
  if (!filterItem(userItem.item, filters)) return false;
  if (!checkFilter('Select', userItem.inCollection.toString(), filters.inCollection)) return false;
  if (!checkFilter('Select', userItem.status, filters.status)) return false;
  return true;
};