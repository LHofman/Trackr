import { ReactElement } from 'react';

import { sort, sortDates, sortValuesStandard } from '../sortUtils';
import getSortControl from '../../components/UI/FilterMenu/getSortControl';

import { Item, ItemFilters, ItemSorting, ItemSortingField } from '../../types/item/item';
import { SortChangeHandler } from '../../types/shared/handlers';

export const getItemsSortControls:
  (extraFields?: ItemSortingField[]) =>
    (currentSort: ItemSorting, currentFilters: ItemFilters, handleSortChange: SortChangeHandler) =>
      ReactElement =
  (extraFields = []) => (currentSort, currentFilters, handleSortChange) => (
    <div>
      {
        extraFields.includes('index') &&
        getSortControl('index', currentSort, handleSortChange)
      }
      { getSortControl('title', currentSort, handleSortChange) }
      { getSortControl('releaseDate', currentSort, handleSortChange) }
      {
        currentFilters.type === 'Movie' &&
        getSortControl('releaseDateDvd', currentSort, handleSortChange)
      }
    </div>
  );

export const itemsSortDefault: ItemSorting = { field: 'title', order: 'asc' };

export const sortItems:
  (sort: ItemSorting, filters: ItemFilters) =>
    (item1: Item, item2: Item) => number = 
  ({ field, order }, filters) =>
    (item1, item2) => {
      return sort(
        { field, order },
        filters,
        (field, item1, item2) => {
          switch (field) {
            case 'index':
              return sortValuesStandard(item1.index, item2.index);
            case 'releaseDate':
              return sortDates(
                { status: item1.releaseDateStatus, value: item1.releaseDate },
                { status: item2.releaseDateStatus, value: item2.releaseDate }
              );
            case 'releaseDateDvd':
              return sortDates(
                { status: item1.releaseDateDvdStatus, value: item1.releaseDateDvd },
                { status: item2.releaseDateDvdStatus, value: item2.releaseDateDvd }
              );
            default:
              return null;
          }
        }
      )(item1, item2);
    }