import React from 'react';
import { Switch, Route, Redirect } from 'react-router-dom';

import AddItem from './items/AddItem';
import EditItem from './items/EditItem';
import Items from './items/Items';
import ItemDetails from './items/ItemDetails';
import Login from './authentication/Login';
import Logout from './authentication/Logout';
import PageNotFound from './PageNotFound';
import Register from './authentication/Register';

import getAuthComponent from '../utils/getAuthComponent';
import getNonAuthComponent from '../utils/getNonAuthComponent';

export default () => (
    <main>
        <Switch>
            <Route exact path="/" render={() => <Redirect to="/items" />} />
            <Route exact path='/items' component={Items} />
            <Route exact path='/items/add' component={getAuthComponent(AddItem)} />
            <Route exact path='/items/:titleId' component={ItemDetails} />
            <Route exact path='/items/:titleId/edit' component={getAuthComponent(EditItem)} />
            <Route exact path='/login' component={getNonAuthComponent(Login)} />
            <Route exact path='/logout' component={getAuthComponent(Logout)} />
            <Route exact path='/register' component={getNonAuthComponent(Register)} />
            <Route path='*' component={PageNotFound} />
        </Switch>
    </main>
)
