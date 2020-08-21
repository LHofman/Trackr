export const getFinishText = (item) => {
  if (!item || !item.type) return '';
  switch (item.type) {
    case 'Album': return 'Listen';
    case 'Book': case 'Comicbook': return 'Read';
    case 'Movie': case 'TvShow': return 'Watch';
    default: return 'Finish';
  }
}

export const getFinishedText = (item) => {
  if (!item || !item.type) return '';
  switch (item.type) {
    case 'Album': return 'Listened';
    case 'Book': case 'Comicbook': return 'Read';
    case 'Movie': case 'TvShow': return 'Watched';
    default: return 'Finished';
  }
}

export const isFinished = (type, status) => {
  if (!type || !status) return false;
  switch (type) {
    case 'Album': return status === 'Listened';
    case 'Book': case 'Comicbook': return status === 'Read';
    case 'Movie': case 'TvShow': return status === 'Watched';
    case 'Video Game': return ['Played', 'Completed'].indexOf(status) > -1;
    default: return false;
  }
}