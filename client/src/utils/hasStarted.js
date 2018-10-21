import moment from 'moment-timezone';

export default (releaseDateStatus, releaseDate) => 
  releaseDateStatus === 'Date' && releaseDate && moment(releaseDate).isBefore(moment());