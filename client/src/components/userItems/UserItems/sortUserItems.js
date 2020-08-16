import sortItems from '../../items/Items/sortItems';

export default ({ field, order }) => (userItem1, userItem2) =>
  sortItems({ field, order })(userItem1.item, userItem2.item);