import moment from 'moment';

export default (type, value1, value2) => {

  switch (type) {
    case 'Date': return sortDates(value1, value2);
    case 'Number': return sortValues(value1 < value2);
    default: return sortValues(value1.toString().toLowerCase(), value2.toString().toLowerCase());
  }
}

const sortDates = (value1, value2) => {
  if (value1.status !== 'Date' && value2.status !== 'Date') return 0;
  if (['Date', 'TBA'].indexOf(value2.status) <= -1) return -1;
  if (['Date', 'TBA'].indexOf(value1.status) <= -1) return 1;

  const date1 = value1.status === 'Date' ? value1.value : '9999-12-31';
  const date2 = value2.status === 'Date' ? value2.value : '9999-12-31';

  return moment(date1).isSameOrBefore(date2) ? -1 : 1;
}

const sortValues = (value1, value2) => {
  if (value1 < value2) return -1;
  if (value1 > value2) return 1;
  return 0;
}