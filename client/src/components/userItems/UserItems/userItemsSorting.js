import { sortItems } from "../../items/Items/itemsSorting";

export const sortUserItems = ({ field, order }) => (userItem1, userItem2) =>
  sortItems({ field, order })(userItem1.item, userItem2.item);