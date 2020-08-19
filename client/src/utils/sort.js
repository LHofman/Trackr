import moment from 'moment';

import { isDateStatusValid } from './dateUtils';

export default (type, value1, value2) => {

  switch (type) {
    case 'Date': return sortDates(value1, value2);
    case 'Number': return sortValues(value1 < value2);
    default: return sortValues(value1.toString().toLowerCase(), value2.toString().toLowerCase());
  }
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

const sortValues = (value1, value2) => {
  if (value1 < value2) return -1;
  if (value1 > value2) return 1;
  return 0;
}