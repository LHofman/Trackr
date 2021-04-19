import { ItemReleaseDateStatus } from '../types/item/item';

export const isDateStatusValid = (status: ItemReleaseDateStatus): boolean =>
  ['Date', 'TBA'].indexOf(status) > -1;