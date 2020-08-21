import React, { Component } from 'react';
import { Link } from 'react-router-dom';
import { Menu } from 'semantic-ui-react';

import isLoggedIn from '../utils/isLoggedIn';

export default class Navbar extends Component {
  render() {
    return (
      <Menu>
        <Menu.Item as={Link} to='/'>
          Home
        </Menu.Item>
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
