import React from 'react';
import { Switch, Route, Redirect } from 'react-router-dom';

import AddItem from './items/AddItem';
import EditItem from './items/EditItem';
import Items from './items/Items';
import ItemDetails from './items/ItemDetails';
import PageNotFound from './PageNotFound';

export default () => (
    <main>
        <Switch>
            <Route exact path="/" render={() => <Redirect to="/items" />} />
            <Route exact path='/items' component={Items} />
            <Route exact path='/items/add' component={AddItem} />
            <Route exact path='/items/:titleId' component={ItemDetails} />
            <Route exact path='/items/:titleId/edit' component={EditItem} />
            <Route path='*' component={PageNotFound} />
        </Switch>
    </main>
)
