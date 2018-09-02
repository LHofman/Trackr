import Items from '../components/items/Items';

import isLoggedIn from './isLoggedIn';

export default component => (isLoggedIn() ? Items : component);
