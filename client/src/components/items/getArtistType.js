export default type => {
  switch(type) {
    case 'Book': return 'Author';
    case 'Movie': return 'Director';
    default: return 'Artist';
  }
}