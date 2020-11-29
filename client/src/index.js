import React from 'react';
import ReactDOM from 'react-dom';
import { Provider } from 'react-redux';
import { BrowserRouter } from 'react-router-dom';
import { combineReducers, createStore } from 'redux';

import App from './App';

import registerServiceWorker from './registerServiceWorker';
import franchisesReducer from './store/franchises/reducer';
import itemsReducer from './store/items/reducer';
import listsReducer from './store/lists/reducer';
import useritemsReducer from './store/userItems/reducer';

const rootReducer = combineReducers({
  franchises: franchisesReducer,
  items: itemsReducer,
  lists: listsReducer,
  userItems: useritemsReducer
});
const store = createStore(
  rootReducer,
  window.__REDUX_DEVTOOLS_EXTENSION__ && window.__REDUX_DEVTOOLS_EXTENSION__()
);

ReactDOM.render(
  <Provider store={store}>
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </Provider>,
  document.getElementById('root')
);
registerServiceWorker();
