import React from 'react';
import Media from 'react-media';
import { Redirect, Route, Switch } from 'react-router-dom';

import AddFranchise from './franchises/FranchiseForm/AddFranchise';
import AddGameObjective from './gameObjectives/GameObjectiveForm/AddGameObjective';
import AddItem from './items/ItemForm/AddItem';
import AddList from './lists/ListForm/AddList';
import EditFranchise from './franchises/FranchiseForm/EditFranchise'
import EditGameObjective from './gameObjectives/GameObjectiveForm/EditGameObjective';
import EditItem from './items/ItemForm/EditItem';
import EditList from './lists/ListForm/EditList';
import EditProfile from './profile/EditProfile/EditProfile';
import Franchises from './franchises/Franchises/Franchises';
import FranchiseDetails from './franchises/FranchiseDetails/FranchiseDetails';
import GameObjectives from './gameObjectives/GameObjectives/GameObjectives';
import HomePage from './HomePage/HomePage';
import Items from './items/Items/Items';
import ItemDetails from './items/ItemDetails/ItemDetails';
import Lists from './lists/Lists/Lists';
import ListDetails from './lists/ListDetails/ListDetails';
import Login from './authentication/AuthForm/Login';
import Logout from './authentication/Logout';
import ManageUsers from './admin/users/ManageUsers/ManageUsers';
import PageNotFound from './PageNotFound';
import Register from './authentication/AuthForm/Register';
import UserDetails from './admin/users/UserDetails/UserDetails';
import UserItems from './userItems/UserItems/UserItems';

import getAuthComponent from '../utils/getAuthComponent';
import getNonAuthComponent from '../utils/getNonAuthComponent';
import '../constants/screenConstants';
import { SPLIT_SCREEN_MIN_WIDTH } from '../constants/screenConstants';

const routes = [
  { path: '/', render: () => <Redirect to='/home' /> },
  { path: '/adminUsers', component: getAuthComponent(ManageUsers), detailsRoute: {
    path: '/adminUsers/:username', component: getAuthComponent(UserDetails)
  } },
  { path: '/franchises', component: Franchises, detailsRoute: {
    path: '/franchises/:titleId', component: FranchiseDetails
  } },
  { path: '/franchises/add', component: getAuthComponent(AddFranchise) },
  { path: '/franchises/:titleId/edit', component: getAuthComponent(EditFranchise) },
  { path: '/home', component: getAuthComponent(HomePage), detailsRoute: {
    path: '/home/:titleId', component: ItemDetails
  } },
  { path: '/items', component: getAuthComponent(Items), detailsRoute: {
    path: '/items/:titleId', component: ItemDetails
  } },
  { path: '/items/filters/:filter', component: Items },
  { path: '/items/add', component: getAuthComponent(AddItem) },
  { path: '/items/:titleId/edit', component: getAuthComponent(EditItem) },
  { path: '/lists', component: getAuthComponent(Lists), detailsRoute: {
    path: '/lists/:titleId', component: ListDetails
  } },
  { path: '/lists/add', component: getAuthComponent(AddList) },
  { path: '/lists/:titleId/edit', component: getAuthComponent(EditList) },
  { path: '/objectives/:titleId', component: GameObjectives },
  { path: '/objectives/:titleId/add', component: getAuthComponent(AddGameObjective) },
  { path: '/objectives/:titleId/subObjectives/:parentId', component: GameObjectives },
  {
    path: '/objectives/:titleId/subObjectives/:parentId/add',
    component: getAuthComponent(AddGameObjective)
  },
  {
    path: '/objectives/:titleId/subObjectives/:parentId/:objectiveId/edit',
    component: getAuthComponent(EditGameObjective)
  },
  {
    path: '/objectives/:titleId/:objectiveId/edit',
    component: getAuthComponent(EditGameObjective)
  },
  { path: '/profile/edit', component: getAuthComponent(EditProfile) },
  { path: '/myItems', component: getAuthComponent(UserItems), detailsRoute: {
    path: '/myItems/:titleId', component: ItemDetails
  } },
  { path: '/myItems/filters/:filter', component: getAuthComponent(UserItems) },
  { path: '/login', component: getNonAuthComponent(Login) },
  { path: '/logout', component: getAuthComponent(Logout) },
  { path: '/register', component: getNonAuthComponent(Register) },
  { exact: false, path: '*', component: PageNotFound }
];

export default () => (
  <main>
    <Media query={`(min-width: ${SPLIT_SCREEN_MIN_WIDTH})`}>
      {matches => matches ? (
        <Switch>
          { routes.map(
            (route, idx) => <Route key={idx} { ...{exact: !route.detailsRoute, ...route }} />
          ) }
        </Switch>
      ) : (
        <Switch>
          { routes.map((route, idx, array) => [
            <Route key={idx} exact { ...route } />,
            route.detailsRoute
              ? <Route key={idx + array.length} exact { ...route.detailsRoute } />
              : null
          ] ).reduce((acc, routes) => [...acc, ...routes], []) }
        </Switch>
      )}
    </Media>
  </main>
);