import { sortItems } from '../items/itemsSorting';

export const sortUserItems = ({ field, order }, filters = {}) => (userItem1, userItem2) =>
  sortItems({ field, order }, filters)(userItem1.item, userItem2.item);