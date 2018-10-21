import moment from 'moment-timezone';

export default releaseDate => releaseDate && moment(releaseDate).isBefore(moment());