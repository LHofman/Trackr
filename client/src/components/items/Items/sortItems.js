import sort from '../../../utils/sort';

export default ({ field, order }) => (item1, item2) => {
  const asc = order === 'asc' ? -1 : 1;

  let sortValue = 0;
  switch (field) {
    case 'releaseDate': sortValue = sort('Date', 
        { status: item1.releaseDateStatus, value: item1.releaseDate },
        { status: item2.releaseDateStatus, value: item2.releaseDate }
      ); break;
    case 'releaseDateDvd': sortValue = sort('Date', 
        { status: item1.releaseDateDvdStatus, value: item1.releaseDateDvd },
        { status: item2.releaseDateDvdStatus, value: item2.releaseDateDvd }
      ); break;
    default: sortValue = sort('', item1[field], item2[field]);
  }
  
  if (sortValue === 0) {
    sortValue = sort('', item1.title, item2.title) * 2;
  }
  
  //If sortValue is larger than 1 or smaller than -1, skip the order
  if (Math.abs(sortValue) > 1) {
    return sortValue / Math.abs(sortValue);
  }

  return sortValue < 1 ? asc : asc * -1;
}