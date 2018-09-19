import isLoggedIn from './isLoggedIn';
import getUser from './getUser';

export default model => {
  return (
    model &&
    model.createdBy &&
    isLoggedIn() &&
    getUser().username === model.createdBy.username
  );
};
