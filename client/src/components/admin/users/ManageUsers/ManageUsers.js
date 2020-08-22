import React, { Component } from 'react';
import { Redirect } from 'react-router-dom';
import { Grid, GridColumn, List } from 'semantic-ui-react';
import fetch from '../../../../utils/fetch';
import User from './User';
import UserDetails from '../UserDetails/UserDetails';

export default class ManageUsers extends Component {
  constructor() {
    super();
    this.state = {
      detailsComponent: null,
      redirect: undefined,
      users: []
    }

    this.setDetailsComponent = this.setDetailsComponent.bind(this);
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

  setDetailsComponent(user) {
    if (!user) {
      this.setState({ detailsComponent: null });
      return;
    }

    if (window.innerWidth < 1200) {
      this.setState({ redirect: `/adminUsers/${user.username}`});
      return;
    }

    this.setState({
      detailsComponent: (
        <UserDetails
          user={ user }
          onBackCallback={ this.setDetailsComponent }
          deleteUser={ this.deleteUser.bind(this) } />
      )
    });
  }

  render() {
    const { detailsComponent, redirect, users } = this.state;

    if (redirect) return <Redirect to={ redirect } />;

    const userComponents = users.map((user) => (
      <User key={ user._id } user={ user } onClickCallback={ this.setDetailsComponent } />
    ));

    return (
      <Grid>
        <GridColumn width={ detailsComponent ? 6 : 16 }>
          <h1>Manage Users</h1>
          <List bulleted>
            { userComponents }
          </List>
        </GridColumn>
        {
          detailsComponent &&
          <GridColumn width={ 10 }>
            { detailsComponent }
          </GridColumn>
        }
      </Grid>
    )
  }
}