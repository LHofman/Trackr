export default type => {
  switch(type) {
    case 'Album': return 'Artist';
    case 'Book': return 'Author';
    case 'Movie': return 'Director';
    case 'TvShow': return 'Creator';
    default: return null;
  }
}