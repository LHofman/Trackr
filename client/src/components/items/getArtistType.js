export default type => {
  switch(type) {
    case 'Book': return 'Author';
    default: return 'Artist';
  }
}