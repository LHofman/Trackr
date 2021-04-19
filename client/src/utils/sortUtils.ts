import moment from 'moment';

import { isDateStatusValid } from './dateUtils';

import { ItemReleaseDate } from '../types/item/item';
import { LooseObject, Maybe, Optional } from '../types/shared/general';

export const sort:
  (
    sort: { field: string, order: 'asc' | 'desc' },
    filters: LooseObject,
    customFieldsSortFunction: (
      field: string,
      item1: LooseObject,
      item2: LooseObject
    ) => Maybe<number>
  ) => (item1: LooseObject, item2: LooseObject) => number =
  ({ field, order }, filters = {}, customFieldsSortFunction) =>
    (item1, item2) => {
      if (filters.title && item1.title) {
        const item1HasExactTitle = item1.title.toLowerCase() === filters.title.toLowerCase();
        const item2HasExactTitle = item2.title.toLowerCase() === filters.title.toLowerCase();

        if (item1HasExactTitle && !item2HasExactTitle) return -1;
        if (!item1HasExactTitle && item2HasExactTitle) return 1;
      }

      const asc = order === 'asc' ? -1 : 1;

      let sortValue: Maybe<number> = null;
      if (customFieldsSortFunction) {
        sortValue = customFieldsSortFunction(field, item1, item2);
      }

      if (sortValue === null) {
        sortValue = sortValuesStandard(item1[field], item2[field]);
      }

      if (sortValue === 0 && item1.title) {
        sortValue = sortValuesStandard(item1.title, item2.title) * 2;
      }
      
      //If sortValue is larger than 1 or smaller than -1, skip the order
      if (Math.abs(sortValue) > 1) {
        return sortValue / Math.abs(sortValue);
      }

      return sortValue < 1 ? asc : asc * -1;
    }

export const sortDates = (
  value1: Optional<ItemReleaseDate>,
  value2: Optional<ItemReleaseDate>
): number => {
  const isDate1Valid = value1 && isDateStatusValid(value1.status);
  const isDate2Valid = value2 && isDateStatusValid(value2.status);

  if (!isDate1Valid && !isDate2Valid) return 0;
  //Return -2 and 2 to skip order, invalid dates should always show at the end
  if (!isDate2Valid) return -2;
  if (!isDate1Valid) return 2;

  const date1 = (value1 && value1.status === 'Date') ? value1.value : '9999-12-31';
  const date2 = (value2 && value2.status === 'Date') ? value2.value : '9999-12-31';

  if (moment(date1).isSame(date2)) return 0;
  return moment(date1).isBefore(date2) ? -1 : 1;
}

export const sortValuesStandard = (
  value1: Optional<String | number>,
  value2: Optional<String | number>
): number => {
  if (!value2) {
    if (!value1) return 0;
    return -2;
  }
  if (!value1) return 2;

  if (value1 < value2) return -1;
  if (value1 > value2) return 1;
  
  return 0;
}