import Login from '../components/authentication/AuthForm/Login';

import isLoggedIn from './isLoggedIn';

export default component => (isLoggedIn() ? component : Login);
