import isLoggedIn from './isLoggedIn';
import getUser from './getUser';

export default item => {
  return (
    item &&
    item.createdBy &&
    isLoggedIn() &&
    getUser().username === item.createdBy.username
  );
};
