import Login from '../components/authentication/Login';

import isLoggedIn from './isLoggedIn';

export default component => (isLoggedIn() ? component : Login);
