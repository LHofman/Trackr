import React, { Component } from 'react';
import { Link } from 'react-router-dom';
import { Menu } from 'semantic-ui-react';

import isLoggedIn from '../utils/isLoggedIn';
import getUser from '../utils/getUser';

export default class Navbar extends Component {
  render() {
    const user = getUser();

    return (
      <Menu>
        {
          (user || {}).isAdmin &&
          <Menu.Item as={Link} to='/'>
            Dashboard
          </Menu.Item>
        }
        <Menu.Item as={Link} to='/items'>
          Items
        </Menu.Item>
        <Menu.Item as={Link} to='/franchises'>
          Franchises
        </Menu.Item>
        <Menu.Item as={Link} to='/myItems'>
          My Items
        </Menu.Item>
        {
          (user || {}).isAdmin &&
          <Menu.Item as={ Link } to='/adminUsers'>
            Manage Users
          </Menu.Item>
        }

        {
          isLoggedIn() ? (
            <Menu.Menu position='right'>
              <Menu.Item name='logout' as={Link} to='/logout' />
            </Menu.Menu>
          ) : (
            <Menu.Menu position='right'>
              <Menu.Item name='register' as={Link} to='/register' />
              <Menu.Item name='login' as={Link} to='/login' />
            </Menu.Menu>
          )
        }
      </Menu>
    )
  }
}
