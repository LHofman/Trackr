import checkFilter from '../../../utils/checkFilter';

export default (item, filters) => {
  if (!checkFilter('Text', item.title, filters.title)) return false;
  if (!checkFilter('Select', item.type, filters.type)) return false;
  if (!checkFilter('Date',
    { status: item.releaseDateStatus, value: item.releaseDate },
    { lowerLimit: filters.releaseDateLowerLimit, upperLimit: filters.releaseDateUpperLimit }
  )) return false;
  if (filters.type === 'Movie' && !checkFilter('Date',
    { status: item.releaseDateDvdStatus, value: item.releaseDateDvd },
    { lowerLimit: filters.releaseDateDvdLowerLimit, upperLimit: filters.releaseDateDvdUpperLimit }
  )) return false;
  if (filters.type && !checkFilter('List', item.artists, filters.artist)) return false;
  if (filters.type === 'Video Game' && !checkFilter('List', item.platforms, filters.platform)) return false;
  return true;
};