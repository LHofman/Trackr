import moment from 'moment';

import { ItemReleaseDate } from '../types/item/item';

export default (type: string, value: any, filter: any): boolean => {
  if (!filter) return true;

  const valueString = value.toString().toLowerCase();
  const filterString = filter.toString().toLowerCase();

  switch (type) {
    case 'Date': return checkDateFilter(value, filter);
    case 'List': return value.indexOf(filter) >= 0;
    case 'Number': return value === filter;
    case 'Select': return valueString === filterString;
    case 'Text': return valueString.includes(filterString);
    default: return true;
  }
}

const checkDateFilter = (
  value: ItemReleaseDate,
  filter: { lowerLimit: string, upperLimit: string }
): boolean => {
  if ((filter.lowerLimit || filter.upperLimit) && value.status !== 'Date') return false;
  if (filter.lowerLimit && !moment(filter.lowerLimit).isSameOrBefore(value.value)) return false;
  if (filter.upperLimit && !moment(filter.upperLimit).isSameOrAfter(value.value)) return false;
  return true;
}