import React from 'react';
import { Redirect, Route, Switch } from 'react-router-dom';

import AddFranchise from './franchises/FranchiseForm/AddFranchise';
import AddGameObjective from './gameObjectives/GameObjectiveForm/AddGameObjective';
import AddItem from './items/ItemForm/AddItem';
import EditFranchise from './franchises/FranchiseForm/EditFranchise'
import EditGameObjective from './gameObjectives/GameObjectiveForm/EditGameObjective';
import EditItem from './items/ItemForm/EditItem';
import Franchises from './franchises/Franchises';
import FranchiseDetails from './franchises/FranchiseDetails/FranchiseDetails';
import GameObjectives from './gameObjectives/GameObjectives';
import HomePage from './HomePage/HomePage';
import Items from './items/Items/Items';
import ItemDetails from './items/ItemDetails';
import Login from './authentication/AuthForm/Login';
import Logout from './authentication/Logout';
import ManageUsers from './admin/users/ManageUsers/ManageUsers';
import PageNotFound from './PageNotFound';
import Register from './authentication/AuthForm/Register';
import UserDetails from './admin/users/UserDetails/UserDetails';
import UserItems from './userItems/UserItems/UserItems';

import getAuthComponent from '../utils/getAuthComponent';
import getNonAuthComponent from '../utils/getNonAuthComponent';

export default () => (
  <main>
    <Switch>
      <Route exact path='/' render={() => <Redirect to='/home' />} />
      <Route exact path='/adminUsers' component={ getAuthComponent(ManageUsers) } />
      <Route exact path='/adminUsers/:username' component={ getAuthComponent(UserDetails) } />
      <Route exact path='/franchises' component={Franchises} />
      <Route exact path='/franchises/add' component={getAuthComponent(AddFranchise)} />
      <Route exact path='/franchises/:titleId' component={FranchiseDetails} />
      <Route exact path='/franchises/:titleId/edit' component={getAuthComponent(EditFranchise)} />
      <Route exact path='/home' component={ HomePage } />
      <Route exact path='/items' component={Items} />
      <Route exact path='/items/add' component={getAuthComponent(AddItem)} />
      <Route exact path='/items/:titleId' component={ItemDetails} />
      <Route exact path='/items/:titleId/edit' component={getAuthComponent(EditItem)} />
      <Route exact path='/objectives/:titleId' component={GameObjectives} />
      <Route exact path='/objectives/:titleId/add' component={getAuthComponent(AddGameObjective)} />
      <Route exact path='/objectives/:titleId/subObjectives/:parentId' component={GameObjectives} />
      <Route exact path='/objectives/:titleId/subObjectives/:parentId/add' component={getAuthComponent(AddGameObjective)} />
      <Route exact path='/objectives/:titleId/subObjectives/:parentId/:objectiveId/edit' component={getAuthComponent(EditGameObjective)} />
      <Route exact path='/objectives/:titleId/:objectiveId/edit' component={getAuthComponent(EditGameObjective)} />
      <Route exact path='/myItems' component={getAuthComponent(UserItems)} />
      <Route exact path='/login' component={getNonAuthComponent(Login)} />
      <Route exact path='/logout' component={getAuthComponent(Logout)} />
      <Route exact path='/register' component={getNonAuthComponent(Register)} />
      <Route path='*' component={PageNotFound} />
    </Switch>
  </main>
)
