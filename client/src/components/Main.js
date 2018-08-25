import React from 'react';
import { Switch, Route, Redirect } from 'react-router-dom';

import AddItem from './items/AddItem';
import EditItem from './items/EditItem';
import Items from './items/Items';
import ItemDetails from './items/ItemDetails';
import Login from './authentication/Login';
import Logout from './authentication/Logout';
import PageNotFound from './PageNotFound';

export default () => (
    <main>
        <Switch>
            <Route exact path="/" render={() => <Redirect to="/items" />} />
            <Route exact path='/items' component={Items} />
            <Route exact path='/items/add' component={AddItem} />
            <Route exact path='/items/:titleId' component={ItemDetails} />
            <Route exact path='/items/:titleId/edit' component={EditItem} />
            <Route exact path='/login' component={Login} />
            <Route exact path='/logout' component={Logout} />
            <Route path='*' component={PageNotFound} />
        </Switch>
    </main>
)
