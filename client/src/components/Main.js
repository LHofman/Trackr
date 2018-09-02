import React from 'react';
import { Switch, Route, Redirect } from 'react-router-dom';

import Items from './items/Items';
import ItemDetails from './items/ItemDetails';
import PageNotFound from './PageNotFound';

export default () => (
    <main>
        <Switch>
            <Route exact path="/" render={() => <Redirect to="/items" />} />
            <Route exact path='/items' component={Items} />
            <Route exact path='/items/:titleId' component={ItemDetails} />
            <Route path='*' component={PageNotFound} />
        </Switch>
    </main>
)
