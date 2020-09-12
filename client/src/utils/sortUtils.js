import moment from 'moment';

import { isDateStatusValid } from './dateUtils';

export const sortValues = (type, value1, value2) => {
  switch (type) {
    case 'Date': return sortDates(value1, value2);
    case 'Number': return sortValuesStandard(value1, value2);
    default: return sortValuesStandard(value1.toString().toLowerCase(), value2.toString().toLowerCase());
  }
}

export const sort = ({ field, order }, filters = {}, customFieldsSortFunction) => (item1, item2) => {
  if (filters.title && item1.title) {
    const item1HasExactTitle = item1.title.toLowerCase() === filters.title.toLowerCase();
    const item2HasExactTitle = item2.title.toLowerCase() === filters.title.toLowerCase();

    if (item1HasExactTitle && !item2HasExactTitle) return -1;
    if (!item1HasExactTitle && item2HasExactTitle) return 1;
  }

  const asc = order === 'asc' ? -1 : 1;

  let sortValue = null;
  if (customFieldsSortFunction) {
    sortValue = customFieldsSortFunction(field, item1, item2);
  }

  if (sortValue === null) {
    sortValue = sortValues('', item1[field], item2[field]);
  }

  if (sortValue === 0 && item1.title) {
    sortValue = sortValues('', item1.title, item2.title) * 2;
  }
  
  //If sortValue is larger than 1 or smaller than -1, skip the order
  if (Math.abs(sortValue) > 1) {
    return sortValue / Math.abs(sortValue);
  }

  return sortValue < 1 ? asc : asc * -1;
}

const sortDates = (value1 = {}, value2 = {}) => {
  const isDate1Valid = isDateStatusValid(value1.status);
  const isDate2Valid = isDateStatusValid(value2.status);

  if (!isDate1Valid && !isDate2Valid) return 0;
  //Return -2 and 2 to skip order, invalid dates should always show at the end
  if (!isDate2Valid) return -2;
  if (!isDate1Valid) return 2;

  const date1 = value1.status === 'Date' ? value1.value : '9999-12-31';
  const date2 = value2.status === 'Date' ? value2.value : '9999-12-31';

  if (moment(date1).isSame(date2)) return 0;
  return moment(date1).isBefore(date2) ? -1 : 1;
}

const sortValuesStandard = (value1, value2) => {
  if (value1 < value2) return -1;
  if (value1 > value2) return 1;
  return 0;
}