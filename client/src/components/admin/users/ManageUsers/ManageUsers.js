import React, { Component } from 'react';
import { Redirect } from 'react-router-dom';
import { List } from 'semantic-ui-react';
import fetch from '../../../../utils/fetch';
import User from './User';
import UserDetails from '../UserDetails/UserDetails';
import ListWithDetails from '../../../../hoc/ListWithDetails';

export default class ManageUsers extends Component {
  constructor() {
    super();
    this.state = {
      redirect: undefined,
      users: []
    }
  }

  componentWillMount() {
    this.getUsers();
  }

  getUsers() {
    fetch('/api/users').then((users) => {
      this.setState({ users });
    });
  }

  deleteUser(user) {
    const users = this.state.users.filter((stateUser) => stateUser._id !== user._id);
    this.setState({ users, detailsComponent: null });
  }

  render() {
    const { redirect, users } = this.state;

    if (redirect) return <Redirect to={ redirect } />;

    const userComponents = users.map((user) => (
      <User key={ user._id } user={ user } match={'/adminUsers'} />
    ));

    return (
      <ListWithDetails
        isLoaded={users.length > 0}
        listWidth={6}
        detailsRoutePath='/adminUsers/:username'
        renderDetailsComponent={(props) => (
          <UserDetails
            user={ users.filter((user) =>
              user.username === props.match.params.username
            )[0] }
            deleteUser={ this.deleteUser.bind(this) } />
        )} >
        <h1>Manage Users</h1>
        <List bulleted>
          {userComponents}
        </List>
      </ListWithDetails>
    );
  }
}